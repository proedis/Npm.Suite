import type { GeaAccount } from './GeaAccount';
import type { GeaIdentityToken } from './GeaIdentityToken';


export interface GeaExchangeResult {

  accessToken: GeaIdentityToken;

  account: GeaAccount;

  refreshToken: GeaIdentityToken;

}
