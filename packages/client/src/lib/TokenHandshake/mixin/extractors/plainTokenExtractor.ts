import type { TokenPlainExtractor } from '../../TokenHandshake.types';


export default function plainTokenExtractor(token: string): TokenPlainExtractor {
  return {
    type   : 'plain',
    extract: {
      token,
      expiresAt: undefined
    }
  };
}
