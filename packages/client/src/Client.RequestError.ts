import { isObject } from '@proedis/utils';

import TransportError from './lib/Transport/TransportError';

import type { RequestMethod } from './lib/Transport/Transport.types';


/**
 * The error every failed client request is normalized into.
 *
 * Its shape is the contract consumers catch, and it has not changed: what changed underneath is where the
 * fields are read from, now that the transport is `fetch` rather than axios.
 */
export default class RequestError {

  public statusCode: number = 500;

  public message: string = 'Server Error';

  public error: string = 'server-error';

  public method: RequestMethod = 'GET';

  public stack: string = 'Generic Request Error';

  public url: string = 'localhost';

  public response: any | null = null;

  public original: any | null = null;


  /**
   * Normalize anything that was thrown into a RequestError.
   *
   * A transport failure that carries a response is described by it — status, ProblemDetails title and
   * detail, the payload itself. One that does not, an abort or a timeout or a dead network, still knows
   * which request it was, so the method and url are taken from there rather than from the current page.
   *
   * @param error Whatever was thrown
   */
  public static fromError(error: any): RequestError {
    /** If received error is already a RequestError return it */
    if (error && error instanceof RequestError) {
      return error;
    }

    /** Create the RequestError instance */
    const requestError = new RequestError();
    requestError.original = error;

    /** Assert the received error is a valid object */
    if (!isObject(error)) {
      return requestError;
    }

    /** Parse the error if it comes from the transport */
    if (TransportError.isTransportError(error)) {
      const { response, request, stack } = error;

      requestError.method = (request.method.toUpperCase() as RequestMethod) ?? requestError.method;
      requestError.url = request.url || requestError.url;
      requestError.stack = stack ?? requestError.stack;

      /**
       * A response means the server answered and its payload describes the failure.
       *
       * 'title' and 'detail' are the ProblemDetails fields the Proedis APIs answer with, and they are read
       * exactly as they were before.
       */
      if (response) {
        requestError.statusCode = response.status;
        requestError.error = (response.data as any)?.title ?? requestError.error;
        requestError.message = (response.data as any)?.detail ?? requestError.message;
        requestError.response = response.data;

        return requestError;
      }

      /** No response: an abort, a timeout, or a request that never reached a server */
      requestError.error = error.kind;
      requestError.message = error.message || requestError.message;

      return requestError;
    }

    /** Parse an Error object */
    if (error instanceof Error) {
      requestError.error = error.name;
      requestError.message = error.message;
      requestError.stack = error.stack ?? requestError.stack;
      requestError.url = typeof window !== 'undefined'
        ? window?.location?.href ?? requestError.url
        : requestError.url;

      return requestError;
    }

    /** Fallback to original error */
    return requestError;
  }

}
