export interface IAuthenticatedEntity {

  /**
   * Gets the id of the authenticated account which is a unique identifier used in database for the account.
   * Default value is the id of the account passed into the constructor of the class.
   */
  id: string;

}
