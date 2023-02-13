import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import type { AnyObject } from '@proedis/types';

import { isValidString, will } from '@proedis/utils';

import Logger from './lib/Logger/Logger';
import Options from './lib/Options/Options';
import Storage from './lib/Storage/Storage';

import RequestError from './Client.RequestError';

import type {
  ClientSettings,
  ClientRequest,
  ClientRequestConfig
} from './Client.types';


export default class Client<StoredData extends AnyObject> {


  // ----
  // Static Helpers
  // ----
  public static sanitizeUrl(url: string): string {
    return encodeURI(url.replace(/(^\/*)|(\/*$)/, ''));
  }


  // ----
  // Internal properties
  // ----
  private readonly _axios: AxiosInstance;

  private readonly _defaultsRequestConfig: ClientRequestConfig | undefined;

  private readonly _initLogger: Logger;

  private readonly _requestLogger: Logger;

  public readonly storage: Storage<StoredData>;


  // ----
  // Client constructor
  // ----
  constructor(settings: ClientSettings<StoredData>) {
    /** Reconfigure the Logger */
    const loggerSettings = new Options(settings.logger);
    Logger.configure({
      enabled    : loggerSettings.getOrDefault('enabled', 'boolean', true),
      minLogLevel: loggerSettings.getOrDefault('minLogLevel', 'string', 'warn')
    });

    /** Create the internal logger instance */
    this._initLogger = Logger.forContext('Initializing');
    this._requestLogger = Logger.forContext('Requests');

    /** Create the internal persistent storage for the client */
    this.storage = new Storage<StoredData>('ClientStore', 'local', settings.initialStorage);

    /** Create the client and store default requests options */
    this._axios = this.createAxiosInstance(settings.requests);
    this._defaultsRequestConfig = settings.requests.defaults;
  }


  // ----
  // Internal methods
  // ----
  private createAxiosInstance(settings: ClientSettings<StoredData>['requests']): AxiosInstance {
    this._initLogger.debug('Creating Axios Instance');

    /** Parse the server configuration settings */
    const serverSettings = new Options(settings.server);

    /** Extract data */
    const isSecure = serverSettings.getOrDefault('secure', 'boolean', true);
    const port = serverSettings.getOrDefault('port', 'number', 80);
    const namespace = serverSettings.get('namespace', 'string');

    /** Create URL Part */
    const urlParts = [
      isSecure ? 'https://' : 'http://',
      Client.sanitizeUrl(serverSettings.get('domain', 'string')!),
      port !== 80 && `:${port}`,
      namespace && `/${Client.sanitizeUrl(namespace)}`
    ].filter(isValidString).join('');

    this._initLogger.info(`AxiosInstance will be created using BaseURL ${urlParts}`);

    /** Return the Axios Instance */
    return axios.create({
      ...settings.axiosConfig,
      baseURL       : urlParts,
      timeout       : serverSettings.getOrDefault('timeout', 'number', 30_000),
      validateStatus: (status) => status >= 200 && status < 300
    });
  }


  // ----
  // Public Methods
  // ----
  public async request<Response>(config: ClientRequest<StoredData>): Promise<Response> {
    /** Assert the client has been loaded */
    if (!this._axios) {
      this._requestLogger.error('AxiosInstance is not ready. Check your configuration');
      throw new Error('Client has not been initialized');
    }

    /** Build request config, checking if is a function */
    const {
      url: initialUrl,
      method = 'GET',
      data,
      params,
      requestConfig
    } = {
      ...(this._defaultsRequestConfig || {}),
      ...(typeof config === 'function' ? config(this) : config)
    };

    /** Sanitize the URL and create the base AxiosRequestConfig */
    const url = Client.sanitizeUrl(initialUrl ?? '');
    const axiosRequestConfig: AxiosRequestConfig = {
      ...requestConfig,
      url,
      method,
      data,
      params
    };

    this._requestLogger.debug('Created base AxiosRequestConfig', axiosRequestConfig);

    /** Use underlying axios instance to make the request */
    try {
      this._requestLogger.debug(`Performing a ${method} request to ${url}`, axiosRequestConfig);

      /** Await for the response */
      const response = (await this._axios(axiosRequestConfig)) as AxiosResponse<Response>;

      this._requestLogger.debug(`Received response from ${url}`, response);

      return response.data;
    }
    catch (error) {
      this._requestLogger.error(`Error received from ${url}`, error);

      throw RequestError.fromError(error);
    }
  }


  public async safeRequest<Response>(config: ClientRequest<StoredData>): Promise<[ RequestError | null, Response ]> {
    const [ error, response ] = await will(this.request<Response>(config));

    if (error) {
      return [ RequestError.fromError(error), null as Response ];
    }

    return [ error, response ];
  }


}
