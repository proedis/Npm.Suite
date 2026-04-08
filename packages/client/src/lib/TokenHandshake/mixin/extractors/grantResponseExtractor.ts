import type { AnyObject } from '@proedis/types';

import type { TokenGrantResponseExtractor } from '../../TokenHandshake.types';


export default function grantResponseExtractor<Response extends AnyObject, Tokens extends string>(
  fromGrantOf: string[],
  extractor: TokenGrantResponseExtractor<Response, Tokens>['extract']
): TokenGrantResponseExtractor<Response, Tokens> {
  return {
    type       : 'grant-response',
    fromGrantOf: fromGrantOf as TokenGrantResponseExtractor<Response, Tokens>['fromGrantOf'],
    extract    : extractor
  };
}
