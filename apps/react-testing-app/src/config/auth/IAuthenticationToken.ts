export interface IAuthenticationToken {

  /**
   * Define the Expiration DateTime of the Token provided by the Token Field
   */
  expiresAt: string;

  /**
   * Define the DateTime from which the Token provided by the Token Field is usable
   */
  from: string;

  /**
   * The token to use on authorized requests
   */
  token: string;

  /**
   * The Token Type
   */
  type: string;

}
