import type { AxiosRequestConfig, Method as RequestMethod } from 'axios';

import type { AnyObject, Serializable } from '@proedis/types';

import type { LoggerOptions } from './lib/Logger/Logger.types';
import type { EnvironmentDependentOptions } from './lib/Options/Options.types';
import type { TokenHandshakeConfiguration, UseTokenTransporter } from './lib/TokenHandshake/TokenHandshake.types';

import type Client from './Client';


/* --------
 * Base Client instance Settings
 * -------- */
export interface ClientSettings<UserData extends Serializable, StoredData extends Serializable, Tokens extends string> {
  /** Default initial stored data for client */
  initialStorage: StoredData;

  /** Define common api endpoint to dialogate with authentication server */
  api?: ClientApi<UserData, StoredData, Tokens>;

  /** Set of extra settings that does not belong to any primary client configuration sections */
  extras?: ClientExtras<UserData, StoredData, Tokens>;

  /** Configure the Logger Library */
  logger?: LoggerOptions;

  /** Configure the Request base settings and server data */
  requests: ClientRequestSettings<Tokens>;

  /** Configure usable tokens while dialogate with API server */
  tokens?: Record<Tokens, TokenHandshakeConfiguration<UserData, StoredData, Tokens>>;

  /**
   * Configure an extractor to load user data into client state.
   * Having user data internally will consider the client as authenticated
   */
  userDataExtractor?: AuthAction<(
    response: any,
    authAction: AuthActionType,
    client: Client<UserData, StoredData, Tokens>
  ) => UserData>;
}


/* --------
 * Initialization Properties
 * -------- */
export interface ClientExtras<UserData extends Serializable, StoredData extends Serializable, Tokens extends string> {
  /**
   * A function that will be executed before the first client initialization
   * flow to check if current authentication must be invalidated
   */
  invalidateExistingAuth?: (client: Client<UserData, StoredData, Tokens>) => boolean;
}


/* --------
 * Client Built In Api
 * -------- */
export interface ClientApi<UserData extends Serializable, StoredData extends Serializable, Tokens extends string> {
  /** Get user data from endpoint server */
  getUserData?: () => ClientRequest<UserData, StoredData, Tokens>;

  /** Login using arbitrary data */
  login?: (data: AnyObject) => ClientRequest<UserData, StoredData, Tokens>;

  /** Logout the client */
  logout?: () => ClientRequest<UserData, StoredData, Tokens>;

  /** Signup using arbitrary data */
  signup?: (data: AnyObject) => ClientRequest<UserData, StoredData, Tokens>;
}


/* --------
 * Client Requests endpoint Settings
 * -------- */
interface ClientRequestSettings<Tokens extends string> {
  /** Set default axios configuration */
  axiosConfig?: Partial<AxiosRequestConfig>;

  /** Set defaults request settings */
  defaults?: ClientRequestConfig<Tokens>;

  /** Set server connection data */
  server: EnvironmentDependentOptions<ServerData>;
}


export interface ServerData {
  /** Set the base URL */
  domain: string;

  /** If a namespace must be appended to URL set this property */
  namespace?: string;

  /** Set the Port */
  port?: number;

  /** Build the URL with https protocol */
  secure?: boolean;

  /** Set the timeout */
  timeout?: number;
}


/* --------
 * Client Auth Action Type Definition
 * -------- */
export type AuthActionType = 'login' | 'signup';

export type AuthAction<T extends Function> = Partial<Record<AuthActionType, T>> | T;


/* --------
 * Client State
 * -------- */
export type LoadingClientState = {
  hasAuth: false;
  isLoaded: false;
  userData: null;
};

export type UnauthorizedClientState = {
  hasAuth: false;
  isLoaded: true;
  userData: null;
};

export type AuthorizedClientState<UserData> = {
  hasAuth: true;
  isLoaded: true;
  userData: UserData;
};

export type ClientState<UserData> =
  | LoadingClientState
  | UnauthorizedClientState
  | AuthorizedClientState<UserData>;


/* --------
 * Base client Request Configuration Object
 * -------- */
export type ClientRequest<UserData extends Serializable, StoredData extends Serializable, Tokens extends string> =
  | ClientRequestConfig<Tokens>
  | ((client: Client<UserData, StoredData, Tokens>) => ClientRequestConfig<Tokens>);

export interface ClientRequestConfig<Tokens extends string> {
  /** The endpoint url to call */
  url?: string;

  /** The HTTP Method to use */
  method?: RequestMethod;

  /** Data to send through body */
  data?: { [key: string]: any };

  /** Request params to append to search string */
  params?: { [key: string]: any };

  /** Override Axios Request config for this specific request */
  requestConfig?: Omit<AxiosRequestConfig, Exclude<keyof ClientRequestConfig<Tokens>, 'requestConfig'>>;

  /** Append token on request */
  useTokens?: Partial<Record<Tokens, UseTokenTransporter>>;
}
