import type { TokenPlainExtractor } from '../../TokenHandshake.types';


export default function plainTokenExtractor(extractor: TokenPlainExtractor['extract']): TokenPlainExtractor {
  return {
    type   : 'plain',
    extract: extractor
  };
}
