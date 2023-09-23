import type { TokenQueryParamExtractor } from '../../TokenHandshake.types';


export default function queryParamExtractor(
  extractor: TokenQueryParamExtractor['extract'],
  hideWhenExtracted: boolean = true
): TokenQueryParamExtractor {
  return {
    type             : 'query-param',
    extract          : extractor,
    hideWhenExtracted: hideWhenExtracted
  };
}
