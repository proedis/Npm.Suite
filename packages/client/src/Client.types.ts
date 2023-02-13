import type { AxiosRequestConfig, Method as RequestMethod } from 'axios';

import type { AnyObject } from '@proedis/types';

import type { LoggerOptions } from './lib/Logger/Logger.types';
import type { EnvironmentDependentOptions } from './lib/Options/Options.types';

import type Client from './Client';


/* --------
 * Base Client instance Settings
 * -------- */
export interface ClientSettings<TStorage extends AnyObject> {
  /** Default initial stored data for client */
  initialStorage: TStorage;

  /** Configure the Logger Library */
  logger?: LoggerOptions;

  /** Configure the Request base settings and server data */
  requests: ClientRequestSettings;
}


/* --------
 * Client Requests endpoint Settings
 * -------- */
interface ClientRequestSettings {
  /** Set default axios configuration */
  axiosConfig?: Partial<AxiosRequestConfig>;

  /** Set defaults request settings */
  defaults?: ClientRequestConfig;

  /** Set server connection data */
  server: EnvironmentDependentOptions<ServerData>;
}


interface ServerData {
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
 * Base client Request Configuration Object
 * -------- */
export type ClientRequest<TStorage extends AnyObject> =
  | ClientRequestConfig
  | ((client: Client<TStorage>) => ClientRequestConfig);

export interface ClientRequestConfig {
  /** The endpoint url to call */
  url?: string;

  /** The HTTP Method to use */
  method?: RequestMethod;

  /** Data to send through body */
  data?: { [key: string]: any };

  /** Request params to append to search string */
  params?: { [key: string]: any };

  /** Override Axios Request config for this specific request */
  requestConfig?: Omit<AxiosRequestConfig, Exclude<keyof ClientRequestConfig, 'requestConfig'>>;
}
