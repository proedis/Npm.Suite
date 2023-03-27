import type { TokenSpecification } from '../../../lib/TokenHandshake/TokenHandshake.types';


export interface GeaIdentityToken extends TokenSpecification {
  /** String representation of the date time from which the token is usable */
  from: string;
}
