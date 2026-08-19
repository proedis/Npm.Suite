import { isNil, isValidString } from '@proedis/utils';

import serializeParams from './serializeParams';
import TransportError from './TransportError';

import type {
  GenericAbortSignal,
  RequestHeaders,
  RequestHeaderValue,
  RequestInitConfig,
  RequestMethod,
  ResponseTransformer,
  TransportRequestConfig,
  TransportResponse,
  TransportSettings
} from './Transport.types';


/* --------
 * Constants
 * -------- */

/** Recognises an absolute url, which is used as it is instead of being resolved against the base url */
const ABSOLUTE_URL_PATTERN = /^([a-z][a-z\d+\-.]*:)?\/\//i;

/** The statuses a request resolves on unless the caller says otherwise */
const DEFAULT_VALIDATE_STATUS = (status: number): boolean => status >= 200 && status < 300;

/** Bodies that go to `fetch` untouched, because they already describe how to encode themselves */
const isPassthroughBody = (body: unknown): boolean => (
  typeof body === 'string'
  || body instanceof FormData
  || body instanceof URLSearchParams
  || body instanceof Blob
  || body instanceof ArrayBuffer
  || ArrayBuffer.isView(body)
);


/* --------
 * Internal Helpers
 * -------- */

/**
 * Flatten authored headers into the string pairs `fetch` accepts.
 *
 * A nil value removes the header rather than sending it empty, which is how the client's `useHeader`
 * deletes one, and an array is joined the way HTTP expects a repeated header to be folded.
 *
 * @param sources Header sets, each one overriding the ones before it
 */
function resolveHeaders(...sources: (RequestHeaders | undefined)[]): Record<string, string> {
  const merged: Record<string, string> = {};

  for (const source of sources) {
    if (!source) {
      continue;
    }

    for (const [ name, value ] of Object.entries(source)) {
      /** A nil value is a removal, including of something an earlier source had set */
      if (isNil(value)) {
        delete merged[name];
        continue;
      }

      merged[name] = Array.isArray(value) ? value.join(', ') : String(value);
    }
  }

  return merged;
}


/** Find a header by name, case insensitively, since HTTP header names are not case sensitive */
function findHeader(headers: Record<string, string>, name: string): string | undefined {
  const lowered = name.toLowerCase();
  const match = Object.keys(headers).find((key) => key.toLowerCase() === lowered);

  return match ? headers[match] : undefined;
}


/** Drop a header by name, case insensitively */
function deleteHeader(headers: Record<string, string>, name: string): void {
  const lowered = name.toLowerCase();

  Object.keys(headers)
    .filter((key) => key.toLowerCase() === lowered)
    .forEach((key) => {
      delete headers[key];
    });
}


/**
 * Bridge whatever the caller passed as a signal, plus the timeout, onto one real `AbortSignal`.
 *
 * `AbortSignal.any` would do this in a line, and is deliberately not used: it landed in Safari 17.4,
 * while the suite's emit target reaches back to 16.4. A caller signal that is not a real `AbortSignal`
 * is bridged here too, which is what keeps the previous transport's tolerance for a mimicked one.
 *
 * @param externalSignal The signal the caller supplied, if any
 * @param timeout Milliseconds before aborting, when set
 * @return The signal to hand to `fetch`, a flag telling a timeout apart from a caller abort, and the
 *   teardown that releases both listeners and the timer
 */
function createRequestSignal(
  externalSignal: AbortSignal | GenericAbortSignal | undefined,
  timeout: number | undefined
): { signal: AbortSignal; hasTimedOut: () => boolean; release: () => void } {
  const controller = new AbortController();

  let timedOut = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const abort = (): void => controller.abort();

  /** An already aborted caller signal has to be honoured before the request is even issued */
  if (externalSignal?.aborted) {
    controller.abort();
  }
  else if (externalSignal?.addEventListener) {
    externalSignal.addEventListener('abort', abort);
  }

  if (typeof timeout === 'number' && timeout > 0) {
    timer = setTimeout(
      () => {
        timedOut = true;
        controller.abort();
      },
      timeout
    );
  }

  return {
    signal      : controller.signal,
    hasTimedOut : () => timedOut,
    release     : () => {
      if (timer !== undefined) {
        clearTimeout(timer);
      }

      externalSignal?.removeEventListener?.('abort', abort);
    }
  };
}


/**
 * Parse a response body the way the previous transport did.
 *
 * With no transformer, a non-empty text body is attempted as JSON and handed back as text when that
 * fails — silently, which is the behaviour being reproduced rather than a choice made here. With
 * transformers, they replace that entirely and receive the raw text.
 *
 * @param body The body, already read as text
 * @param headers The response headers
 * @param status The response status
 * @param transformers The transformers to apply, if any
 */
function parseBody(
  body: string,
  headers: Record<string, string>,
  status: number,
  transformers: ResponseTransformer | ResponseTransformer[] | undefined
): any {
  if (transformers) {
    const chain = Array.isArray(transformers) ? transformers : [ transformers ];

    return chain.reduce<any>(
      (data, transformer) => transformer(data as string, headers, status),
      body
    );
  }

  if (!body) {
    return body;
  }

  try {
    return JSON.parse(body);
  }
  catch {
    return body;
  }
}


/* --------
 * Transport Definition
 * -------- */

/**
 * The HTTP transport the client performs its requests with, built on `fetch`.
 *
 * It replaces the axios instance that used to sit here, and it is deliberately small: the audit that
 * preceded this found the client used interceptors, cancel tokens, progress events, adapters,
 * `paramsSerializer`, `transformRequest`, `withCredentials` and `responseType` exactly zero times. What
 * it did use is a base url, a timeout, default headers, a status check, query serialization and an abort
 * signal — which is what this is.
 *
 * The one part that is not simply "call fetch" is the query string: {@link serializeParams} reproduces
 * axios's format byte for byte, verified against it over hundreds of generated shapes, because a server
 * that reads `ids[]=1` differently from `ids[0]=1` fails silently and only in production.
 */
export default class Transport {


  // ----
  // Private instance fields
  // ----

  private readonly _baseUrl: string;

  private readonly _defaults: RequestInitConfig;

  private readonly _defaultHeaders: RequestHeaders;

  private readonly _timeout: number | undefined;


  // ----
  // Transport constructor
  // ----
  constructor(settings: TransportSettings) {
    this._baseUrl = settings.baseUrl;
    this._timeout = settings.timeout;
    this._defaults = settings.defaults ?? {};
    this._defaultHeaders = { ...settings.headers };
  }


  // ----
  // Public properties
  // ----

  /** The url every relative request path is resolved against */
  public get baseUrl(): string {
    return this._baseUrl;
  }


  /** The headers sent with every request, as currently configured */
  public get defaultHeaders(): Readonly<RequestHeaders> {
    return this._defaultHeaders;
  }


  // ----
  // Public methods
  // ----

  /**
   * Set a default header, or remove it when the value is nil.
   *
   * @param name The header name
   * @param value The value to send, or nil to remove the header
   */
  public useHeader(name: string, value: RequestHeaderValue): void {
    if (isNil(value)) {
      delete this._defaultHeaders[name];
      return;
    }

    this._defaultHeaders[name] = value;
  }


  /**
   * Build the full url a request will be sent to, query string included.
   *
   * @param config The request to resolve
   */
  public buildUrl(config: Pick<TransportRequestConfig, 'url' | 'params' | 'baseUrl'>): string {
    const path = config.url ?? '';

    /** A request may point at a different host entirely, which is what 'baseUrl' overrides */
    const base = config.baseUrl ?? this._baseUrl;

    /** An absolute url stands on its own, exactly as it did before */
    const url = ABSOLUTE_URL_PATTERN.test(path)
      ? path
      : [ base, path ].filter(isValidString).join('/');

    const query = config.params ? serializeParams(config.params) : '';

    if (!query) {
      return url;
    }

    return `${url}${url.includes('?') ? '&' : '?'}${query}`;
  }


  /**
   * Perform a request.
   *
   * @param config The request to perform
   * @throws {TransportError} On a rejected status, an abort, a timeout, a network failure or a body that
   *   could not be read
   */
  public async request<Data>(config: TransportRequestConfig): Promise<TransportResponse<Data>> {
    const merged: TransportRequestConfig = { ...this._defaults, ...config };

    const method = (merged.method ?? 'GET').toUpperCase() as RequestMethod;
    const url = this.buildUrl(merged);

    const headers = resolveHeaders(this._defaultHeaders, merged.headers);
    const body = this._resolveBody(merged.data, headers);

    const timeout = merged.timeout ?? this._timeout;
    const { signal, hasTimedOut, release } = createRequestSignal(merged.signal, timeout);

    const failedRequest = { method, url };

    let response: Response;

    try {
      response = await fetch(url, {
        method,
        headers,
        signal,
        ...(body === undefined ? {} : { body }),
        ...(merged.credentials ? { credentials: merged.credentials } : {}),
        ...(merged.cache ? { cache: merged.cache } : {}),
        ...(merged.mode ? { mode: merged.mode } : {}),
        ...(merged.redirect ? { redirect: merged.redirect } : {}),
        ...(merged.referrer ? { referrer: merged.referrer } : {}),
        ...(merged.referrerPolicy ? { referrerPolicy: merged.referrerPolicy } : {}),
        ...(merged.integrity ? { integrity: merged.integrity } : {}),
        ...(merged.keepalive ? { keepalive: merged.keepalive } : {})
      });
    }
    catch (error) {
      /** An abort surfaces as a rejection too, and has to be told apart from a genuine network failure */
      if (signal.aborted) {
        throw new TransportError(
          hasTimedOut() ? `timeout of ${timeout}ms exceeded` : 'Request aborted',
          'abort',
          failedRequest,
          undefined,
          error
        );
      }

      throw new TransportError(
        error instanceof Error ? error.message : 'Network Error',
        'network',
        failedRequest,
        undefined,
        error
      );
    }
    finally {
      release();
    }

    const responseHeaders = Object.fromEntries(response.headers.entries());

    /** Read the body once, whatever the status: an error payload is as interesting as a successful one */
    let rawBody: string;

    try {
      rawBody = await response.text();
    }
    catch (error) {
      throw new TransportError(
        'Unable to read the response body',
        'parse',
        failedRequest,
        { data: undefined, status: response.status, statusText: response.statusText, headers: responseHeaders },
        error
      );
    }

    let data: Data;

    try {
      data = parseBody(rawBody, responseHeaders, response.status, merged.transformResponse) as Data;
    }
    catch (error) {
      throw new TransportError(
        error instanceof Error ? error.message : 'Unable to transform the response body',
        'parse',
        failedRequest,
        { data: rawBody, status: response.status, statusText: response.statusText, headers: responseHeaders },
        error
      );
    }

    const transportResponse: TransportResponse<Data> = {
      data,
      status    : response.status,
      statusText: response.statusText,
      headers   : responseHeaders
    };

    const validateStatus = merged.validateStatus === undefined
      ? DEFAULT_VALIDATE_STATUS
      : merged.validateStatus;

    if (validateStatus && !validateStatus(response.status)) {
      throw new TransportError(
        `Request failed with status code ${response.status}`,
        'status',
        failedRequest,
        transportResponse
      );
    }

    return transportResponse;
  }


  // ----
  // Private methods
  // ----

  /**
   * Turn the authored body into something `fetch` accepts, setting the content type when it can be
   * inferred and removing it when it must not be set at all.
   *
   * ⚠️ The FormData branch is the one that matters. A multipart body carries a boundary that only the
   * platform can generate, so `Content-Type` has to be left unset for `fetch` to fill it in. The previous
   * transport set `multipart/form-data` explicitly and got away with it because axios rewrote the header
   * itself; doing the same here produces a body no server can parse.
   *
   * @param data The authored body
   * @param headers The resolved headers, mutated in place when a content type has to be added or removed
   */
  private _resolveBody(data: unknown, headers: Record<string, string>): BodyInit | undefined {
    if (isNil(data)) {
      return undefined;
    }

    if (data instanceof FormData) {
      deleteHeader(headers, 'Content-Type');
      return data;
    }

    if (isPassthroughBody(data)) {
      return data as BodyInit;
    }

    /** A plain object, an array or anything else serializable travels as JSON */
    if (!findHeader(headers, 'Content-Type')) {
      headers['Content-Type'] = 'application/json';
    }

    return JSON.stringify(data);
  }

}
