import { isValidString } from '@proedis/utils';

import type { TokenPlainExtractor } from '../../TokenHandshake.types';


export default function plainTokenExtractor(token: string | undefined): TokenPlainExtractor {
  return {
    type   : 'plain',
    extract: isValidString(token)
      ? { token, expiresAt: undefined }
      : false
  };
}
