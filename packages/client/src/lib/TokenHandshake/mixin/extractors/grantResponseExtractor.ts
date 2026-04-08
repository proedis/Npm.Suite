import type { AnyObject } from '@proedis/types';

import type { TokenGrantResponseExtractor } from '../../TokenHandshake.types';


export default function grantResponseExtractor<Response extends AnyObject, Tokens extends string>(
  fromGrantOf: string[],
  extractor: TokenGrantResponseExtractor<Response, Tokens>['extract']
) {
  return {
    type   : 'grant-response',
    fromGrantOf,
    extract: extractor
  };
}
