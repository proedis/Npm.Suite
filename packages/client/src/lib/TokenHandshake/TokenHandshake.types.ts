import type { Serializable } from '@proedis/types';

import type Client from '../../Client';
import type { NonTransformableClientRequest } from '../../Client.types';

import type { StoragePersistency } from '../Storage/Storage';

import type { AuthAction, AuthActionType } from '../../Client.types';


// ----
// Token Handshake Configuration
// ----
export interface TokenHandshakeConfiguration<
  UserData extends Serializable,
  StoredData extends Serializable,
  Tokens extends string
> {
  /** User defined function to check if a token is valid or not */
  checkValidity?: (
    token: Partial<TokenSpecification> | undefined,
    client: Client<UserData, StoredData, Tokens>
  ) => boolean;

  /** Set of extractors that could be used to get token */
  extractors?: TokenExtractor<any>[];

  /** Grant request configuration */
  grant?: NonTransformableClientRequest<UserData, StoredData, Tokens>;

  /** Set if client must invalidate auth on grant error */
  invalidateAuthOnGrantError?: boolean;

  /** Set token persistency, default to `local` (localstorage) */
  persistency?: StoragePersistency;

  /**
   * Configure the admitted transporters to send the token
   * within the request
   */
  transporters?: TokenTransporter[];

  /**
   * To know if a token is expired or not, the expireDate
   * field will be used.
   * A number of milliseconds could be passed through
   * validityThreshold configuration param to consider a token expired
   * before the real expiration time.
   * This is useful to avoid problems while sending valid not expire tokens
   * that could expire during the request
   */
  validityThreshold?: number;
}


// ----
// Token Spec
// ----
export interface TokenSpecification {
  /** The expiration datetime */
  expiresAt: string | undefined;

  /** The token string to use */
  token: string;
}


// ----
// Token transporter methods
// --
// A token transporter define the method used to communicate
// the token to API Server.
// ----
export type TokenTransporter =
  & { isDefault?: boolean }
  & (TokenAsHeaderTransporter | TokenAsQueryParamsTransporter | TokenAsBearerTransporter);

export type UseTokenTransporter = boolean | TokenTransporter['type'];

/** Pass the token to API Server using default Bearer Specification */
type TokenAsBearerTransporter = { type: 'bearer' };

/** Append the token to request using header */
type TokenAsHeaderTransporter = { type: 'header', value: string };

/** Append the token to request using query parameter */
type TokenAsQueryParamsTransporter = { type: 'query', value: string };


// ----
// Token extractor methods
// --
// A token extractor define how a token could be extracted from
// a Server Response received by the client
// ----
export type TokenExtractor<Response extends Serializable> =
  | TokenAuthResponseExtractor<Response>
  | TokenQueryParamExtractor
  | TokenPlainExtractor;

export type TokenAuthResponseExtractor<Response extends Serializable> = {
  type: 'auth-response',
  extract: AuthAction<(
    authResponse: Response,
    authAction: AuthActionType,
    client: Client<any, any, any>
  ) => TokenSpecification | undefined>
};

export type TokenQueryParamExtractor = {
  type: 'query-param',
  extract: {
    token: string,
    expiresAt: string
  },
  hideWhenExtracted?: boolean;
};

export type TokenPlainExtractor = {
  type: 'plain',
  extract: TokenSpecification | false
};
