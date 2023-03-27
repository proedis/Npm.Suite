export interface GeaAccount {
  /** The date time at which the identity has been created */
  createdAt: string,

  /** Registered email for Account */
  email: string,

  /** The date time at which the user has confirmed email address */
  emailVerifiedAt: string,

  /** Internal Gea identification GUID */
  id: string,

  /** Gea username usable for authentication */
  username: string
}
