import type { RequestMethod, TransportResponse } from './Transport.types';


/* --------
 * Exported Types
 * -------- */

/** Why a request failed, which decides how much of the error is populated */
export type TransportErrorKind =
  /** The server answered with a status the caller did not accept */
  | 'status'
  /** The request was aborted, by a caller signal or by the timeout */
  | 'abort'
  /** The request never reached a server: DNS, connection, CORS, offline */
  | 'network'
  /** The response arrived but its body could not be read or transformed */
  | 'parse';


/* --------
 * Error Definition
 * -------- */

/**
 * The error the transport throws, carrying everything needed to describe the failure.
 *
 * `RequestError` is what a consumer catches; this is the shape it reads. It exists as its own class so
 * that recognising a transport failure is an `instanceof` check rather than duck typing, which is what
 * the axios error it replaces provided.
 */
export default class TransportError extends Error {

  /** What kind of failure this was */
  public readonly kind: TransportErrorKind;

  /** The response, when one arrived at all — absent for a network failure, an abort or a timeout */
  public readonly response: TransportResponse<any> | undefined;

  /** The request that failed, as far as it was built */
  public readonly request: { method: RequestMethod; url: string };

  /** Whatever was thrown underneath, when this error wraps something else */
  public readonly cause: unknown;


  constructor(
    message: string,
    kind: TransportErrorKind,
    request: { method: RequestMethod; url: string },
    response?: TransportResponse<any>,
    cause?: unknown
  ) {
    super(message);

    /** Set explicitly: extending a built-in loses the subclass prototype when compiled down */
    Object.setPrototypeOf(this, TransportError.prototype);

    this.name = 'TransportError';
    this.kind = kind;
    this.request = request;
    this.response = response;
    this.cause = cause;
  }


  /** Whether a value is a transport error */
  public static isTransportError(value: unknown): value is TransportError {
    return value instanceof TransportError;
  }

}
