import type { AnyObject } from '@proedis/types';

import type { ResponseTransformer } from '../lib/Transport/Transport.types';


/**
 * Build a response transformer that parses the body and reshapes it into something else.
 *
 * The transformer replaces the default JSON parsing entirely, so it receives the body as text and is the
 * one deciding what comes out — which is why it parses the payload itself. A non-200 status yields
 * `undefined`, leaving the failure to be described by the error rather than by a half-transformed body.
 *
 * @param transformer Turns the parsed payload into the shape the caller wants
 *
 * @example
 * // an identity endpoint that answers with a wrapper the client does not care about
 * requestConfig: {
 *   transformResponse: transformResponseObject<ExchangeResult, TokenSpecification>(
 *     (response) => response.refreshToken
 *   )
 * }
 */
export default function transformResponseObject<T extends AnyObject, R extends AnyObject = T>(
  transformer: (data: T) => R
): ResponseTransformer {
  return function responseTransformer(data, _headers, status) {
    /** Apply the transformer only if status code is ok */
    if (status !== 200) {
      return undefined;
    }

    /** Try to parse the received data, transforming into a valid object */
    try {
      const parsedData = JSON.parse(data) as T;
      return transformer(parsedData);
    }
    catch {
      return undefined;
    }
  };
}
