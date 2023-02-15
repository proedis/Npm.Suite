import type { Serializable } from '@proedis/types';

import type { TokenAuthResponseExtractor } from '../../TokenHandshake.types';


export default function authResponseExtractor<Response extends Serializable>(
  extractor: TokenAuthResponseExtractor<Response>['extract']
): TokenAuthResponseExtractor<Response> {
  return {
    type   : 'auth-response',
    extract: extractor
  };
}
