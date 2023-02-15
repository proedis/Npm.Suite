import type { TokenAuthResponseExtractor } from '../../TokenHandshake.types';


export default function authResponseExtractor(extractor: TokenAuthResponseExtractor['extract']): TokenAuthResponseExtractor {
  return {
    type   : 'auth-response',
    extract: extractor
  };
}
