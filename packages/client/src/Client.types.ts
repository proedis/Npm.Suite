import type { AxiosRequestConfig, Method as RequestMethod } from 'axios';

import type { ClassConstructor } from 'class-transformer';

import type { AnyObject } from '@proedis/types';

import type { LoggerOptions } from './lib/Logger/Logger.types';
import type { EnvironmentDependentOptions } from './lib/Options/Options.types';
import type { StorageProvider } from './lib/Storage/Storage.types';
import type { TokenHandshakeConfiguration, UseTokenTransporter } from './lib/TokenHandshake/TokenHandshake.types';

import type Client from './Client';


/* --------
 * Base Client instance Settings
 * -------- */
export interface ClientSettings<UserData extends AnyObject, StoredData extends AnyObject, Tokens extends string> {
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

  /** Customize providers for internal Client Module */
  providers?: Partial<ClientProviders>;

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
export interface ClientExtras<UserData extends AnyObject, StoredData extends AnyObject, Tokens extends string> {
  /**
   * A function that will be executed before the first client initialization
   * flow to check if current authentication must be invalidated
   */
  invalidateExistingAuth?: (client: Client<UserData, StoredData, Tokens>) => boolean;
}


/* --------
 * Client Built In Api
 * -------- */
export interface ClientApi<UserData extends AnyObject, StoredData extends AnyObject, Tokens extends string> {
  /** Get user data from endpoint server */
  getUserData?: <Response>() => ClientRequest<UserData, StoredData, Tokens, Response>;

  /** Login using arbitrary data */
  login?: <Response>(data: AnyObject) => ClientRequest<UserData, StoredData, Tokens, Response>;

  /** Logout the client */
  logout?: <Response>() => ClientRequest<UserData, StoredData, Tokens, Response>;

  /** Signup using arbitrary data */
  signup?: <Response>(data: AnyObject) => ClientRequest<UserData, StoredData, Tokens, Response>;
}


/* --------
 * Client Providers for internal Module
 * -------- */
export interface ClientProviders {
  /** Storage Provider */
  storage: StorageProvider;
}


/* --------
 * Client Requests endpoint Settings
 * -------- */
interface ClientRequestSettings<Tokens extends string> {
  /** Set default axios configuration */
  axiosConfig?: Partial<AxiosRequestConfig>;

  /** Set defaults request settings */
  defaults?: NonTransformableClientRequestConfig<Tokens>;

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
export type UnauthorizedClientState = {
  hasAuth: false;
  userData: null;
};

export type AuthorizedClientState<UserData extends AnyObject> = {
  hasAuth: true;
  userData: UserData;
};

export type ClientState<UserData extends AnyObject> =
  {
    isReady: boolean,
    isLoaded: boolean
  }
  & (UnauthorizedClientState | AuthorizedClientState<UserData>);


/* --------
 * Base client Request Configuration Object
 * -------- */
export type ClientRequest<
  UserData extends AnyObject,
  StoredData extends AnyObject,
  Tokens extends string,
  Response
> =
  | ClientRequestConfig<Tokens, Response>
  | ((client: Client<UserData, StoredData, Tokens>) => ClientRequestConfig<Tokens, Response>);


export type NonTransformableClientRequest<
  UserData extends AnyObject,
  StoredData extends AnyObject,
  Tokens extends string
> =
  | NonTransformableClientRequestConfig<Tokens>
  | ((client: Client<UserData, StoredData, Tokens>) => NonTransformableClientRequestConfig<Tokens>);


export type ClientRequestConfig<Tokens extends string, Response> =
  & NonTransformableClientRequestConfig<Tokens>
  & { transformer?: ClassConstructor<Response extends Array<infer U> ? U : Response> };


export type NonTransformableClientRequestConfig<Tokens extends string> =
  & BaseClientRequestConfig<Tokens>
  & RequestType;


interface BaseClientRequestConfig<Tokens extends string> {
  /** The endpoint url to call */
  url?: string;

  // /** The HTTP Method to use */
  // method?: RequestMethod;
  //
  // /** Data to send through body */
  // data?: { [key: string]: any };

  /** Request params to append to search string */
  params?: {
    [key: string]: any
  };

  /** Override Axios Request config for this specific request */
  requestConfig?: Omit<AxiosRequestConfig, Exclude<keyof ClientRequestConfig<Tokens, Response>, 'requestConfig'>>;

  /** Append token on request */
  useTokens?: Partial<Record<Tokens, UseTokenTransporter>>;
}


/* --------
 * Method Dependent Request
 * -------- */
type RequestType = GetRequestType | DataSendRequestType;

interface GetRequestType {
  /** The HTTP Method to use */
  method?: 'GET';
}

interface DataSendRequestType {
  /** The HTTP Method to use */
  method?: Exclude<RequestMethod, 'get' | 'GET'>;

  /** Data to send through body */
  data?: {
    [key: string]: any
  } | FormData;

  /** List of files to append to request */
  files?: {
    [key: string]: Blob | FileDescriptor | (Blob | FileDescriptor)[]
  };
}


/* --------
 * Files Types and Interfaces
 * -------- */
export type FileDescriptor = FileDescriptorData & (Base64FileDescriptor | ReactNativeFileDescriptor);

interface Base64FileDescriptor {
  /** Base64 file */
  base64: string;
}

interface ReactNativeFileDescriptor {
  /** The local file system uri */
  uri: string;
}

interface FileDescriptorData {
  /** The mime file type */
  type: string;

  /** The name of the file to send */
  name: string;
}
