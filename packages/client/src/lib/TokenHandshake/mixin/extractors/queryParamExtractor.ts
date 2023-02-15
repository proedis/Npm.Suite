import type { TokenQueryParamExtractor } from '../../TokenHandshake.types';


export default function queryParamExtractor(extractor: TokenQueryParamExtractor['extract']): TokenQueryParamExtractor {
  return {
    type   : 'query-param',
    extract: extractor
  };
}
