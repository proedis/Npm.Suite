import type { AnyObject } from '@proedis/types';


/* --------
 * Request Primitives
 * -------- */

/**
 * The HTTP methods a request may use.
 *
 * Both cases are accepted because the previous transport's type did, and request configurations in the
 * wild are written either way.
 */
export type RequestMethod =
  | 'get' | 'GET'
  | 'post' | 'POST'
  | 'put' | 'PUT'
  | 'patch' | 'PATCH'
  | 'delete' | 'DELETE'
  | 'head' | 'HEAD'
  | 'options' | 'OPTIONS';


/** What a single header may be set to. A nil value removes the header instead of sending it empty */
export type RequestHeaderValue = string | string[] | number | boolean | null | undefined;

/** A set of headers, as authored by a caller */
export type RequestHeaders = Record<string, RequestHeaderValue>;


/**
 * An abort signal, described by what is actually used rather than by its class.
 *
 * A real `AbortSignal` satisfies it, and so does anything that mimics one — which the previous transport
 * accepted, so it keeps being accepted here. A signal that is not a real `AbortSignal` is bridged onto
 * one internally, because `fetch` will not take anything else.
 */
export interface GenericAbortSignal {
  readonly aborted: boolean;

  addEventListener?: (type: 'abort', listener: () => void) => void;

  removeEventListener?: (type: 'abort', listener: () => void) => void;

  onabort?: ((...args: any[]) => any) | null;
}


/**
 * A function applied to the raw response body, replacing the default JSON parsing.
 *
 * It receives the body as text, exactly as the previous transport's `transformResponse` did, so a
 * transformer that parses the payload itself keeps working unchanged.
 */
export type ResponseTransformer = (data: string, headers: Record<string, string>, status: number) => any;


/* --------
 * Request Configuration
 * -------- */

/**
 * The transport level options a caller may set on a single request.
 *
 * This is the type behind a request's `requestConfig`, and it replaces the axios configuration object
 * that used to sit there. It is deliberately a short list: it covers what the suite and its consumers
 * actually set — headers above all — plus the `fetch` options that have an obvious meaning for an API
 * call. Anything absent from it was absent from the requests too.
 */
export interface RequestInitConfig {
  /**
   * Resolve this request against a different base url than the transport's.
   *
   * The escape hatch for an endpoint that lives somewhere else entirely — the Gea variant reaches a
   * separate identity host this way, while every other call goes to the application API.
   */
  baseUrl?: string;

  /** Headers to send, merged over the transport defaults */
  headers?: RequestHeaders;

  /** Query string parameters, serialized the same way the previous transport serialized them */
  params?: AnyObject;

  /** Milliseconds before the request is aborted. Overrides the transport default for this call */
  timeout?: number;

  /** An external signal that aborts the request */
  signal?: AbortSignal | GenericAbortSignal;

  /** Decide which status codes resolve instead of throwing. Defaults to 2xx */
  validateStatus?: ((status: number) => boolean) | null;

  /**
   * Replace the default JSON parsing of the response body.
   *
   * Receives the body as text. Several transformers run in order, each one taking the previous result.
   */
  transformResponse?: ResponseTransformer | ResponseTransformer[];

  /** Passed straight to `fetch` */
  credentials?: RequestCredentials;

  /** Passed straight to `fetch` */
  cache?: RequestCache;

  /** Passed straight to `fetch` */
  mode?: RequestMode;

  /** Passed straight to `fetch` */
  redirect?: RequestRedirect;

  /** Passed straight to `fetch` */
  referrer?: string;

  /** Passed straight to `fetch` */
  referrerPolicy?: ReferrerPolicy;

  /** Passed straight to `fetch` */
  integrity?: string;

  /** Passed straight to `fetch` */
  keepalive?: boolean;
}


/** A complete request, as handed to the transport */
export interface TransportRequestConfig extends RequestInitConfig {
  /** The path to call, relative to the transport base url unless it is absolute */
  url?: string;

  /** The HTTP method, defaulting to GET */
  method?: RequestMethod;

  /** The request body. A plain object is sent as JSON, a FormData as multipart */
  data?: any;
}


/* --------
 * Response
 * -------- */

/** What the transport hands back on a status the caller accepted */
export interface TransportResponse<Data> {
  /** The parsed body */
  data: Data;

  /** The HTTP status code */
  status: number;

  /** The HTTP status text */
  statusText: string;

  /** The response headers, lowercased by the platform */
  headers: Record<string, string>;
}


/* --------
 * Settings
 * -------- */

/** How a transport instance is built */
export interface TransportSettings {
  /** The url every relative request path is resolved against */
  baseUrl: string;

  /** Milliseconds before a request is aborted, unless the request overrides it */
  timeout?: number;

  /** Headers sent with every request, unless a request overrides them */
  headers?: RequestHeaders;

  /** Options applied to every request, each one overridable per call */
  defaults?: RequestInitConfig;
}
