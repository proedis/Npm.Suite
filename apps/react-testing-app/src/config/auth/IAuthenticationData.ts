import type { IAuthenticatedEntity } from './IAuthenticatedEntity';
import type { IAuthenticationToken } from './IAuthenticationToken';


export interface IAuthenticationData {

  /**
   * The access token issued for the authenticated account. This is required to authenticate subsequent API calls.
   */
  accessToken: IAuthenticationToken;

  /**
   * The account that has been authenticated.
   */
  entity: IAuthenticatedEntity;

  /**
   * The refresh token issued for the authenticated account. This can be used to request a new access token
   * when the current one expires, without requiring the user to re-authenticate.
   */
  refreshToken: IAuthenticationToken;

}
