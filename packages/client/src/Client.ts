import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, GenericAbortSignal } from 'axios';

import { Observable } from 'rxjs';

import type { AnyObject, Serializable } from '@proedis/types';

import { hasEqualHash, isObject, isValidString, mergeObjects, will } from '@proedis/utils';

import Logger from './lib/Logger/Logger';
import Options from './lib/Options/Options';
import Storage from './lib/Storage/Storage';
import TokenHandshake from './lib/TokenHandshake/TokenHandshake';

import RequestError from './Client.RequestError';

import type {
  ClientApi,
  ClientSettings,
  ClientState,
  ClientRequest,
  ClientRequestConfig
} from './Client.types';

import type { AuthAction, TokenSpecification } from './lib/TokenHandshake/TokenHandshake.types';
import RequestSubscriber from './Client.RequestSubscriber';


export default class Client<UserData extends Serializable, StoredData extends Serializable, Tokens extends string> {


  // ----
  // Static Helpers
  // ----
  public static sanitizeUrl(url: string): string {
    return encodeURI(url.replace(/(^\/*)|(\/*$)/, ''));
  }


  /**
   * Perform a hash check using oldData and newData to
   * get if there are some changes between the two values.
   * This method will simply expose the `hasEqualHash` method
   * from `@proedis/utils` package using Client static method
   * @param oldData
   * @param newData
   */
  public static areDataEquals(oldData: any, newData: any): boolean {
    return hasEqualHash(oldData, newData);
  }


  // ----
  // Static constant properties
  // ----
  private static _defaultClientState: ClientState<any> = {
    isLoaded: false,
    hasAuth : false,
    userData: null
  };


  // ----
  // Internal properties
  // ----
  private readonly _axios: AxiosInstance;

  private readonly _defaultsRequestConfig: ClientRequestConfig<Tokens> | undefined;

  private readonly _initLogger: Logger;

  private readonly _requestLogger: Logger;

  private readonly _tokensHandshake = new Map<Tokens, TokenHandshake<UserData, StoredData, Tokens>>();

  public readonly state: Storage<ClientState<UserData>>;

  public readonly storage: Storage<StoredData>;


  // ----
  // Client constructor
  // ----
  constructor(appName: string, private readonly _settings: ClientSettings<UserData, StoredData, Tokens>) {
    /** Set the Storage Name */
    Storage.AppName = appName;

    /** Reconfigure the Logger */
    const loggerSettings = new Options(_settings.logger);
    Logger.configure({
      enabled    : loggerSettings.getOrDefault('enabled', 'boolean', true),
      minLogLevel: loggerSettings.getOrDefault('minLogLevel', 'string', 'warn')
    });

    /** Create the internal logger instance */
    this._initLogger = Logger.forContext('Initializing');
    this._requestLogger = Logger.forContext('Requests');

    /** Create the internal persistent storage for the client */
    this.storage = new Storage<StoredData>('ClientStore', 'local', _settings.initialStorage);

    /** Create TokenHandshake for all requested tokens */
    if (isObject(_settings.tokens)) {
      /** Loop each token and create the Handshake instance */
      (Object.keys(_settings.tokens) as Tokens[]).forEach((tokenName) => {
        this._tokensHandshake.set(tokenName, new TokenHandshake(tokenName, _settings.tokens![tokenName], this));
      });
    }

    /** Create the client and store default requests options */
    this._axios = this._createAxiosInstance(_settings.requests);
    this._defaultsRequestConfig = _settings.requests.defaults;

    /** Save initial client state */
    this.state = new Storage<ClientState<UserData>>('State', 'page', Client._defaultClientState);

    /** Initialize the client */
    this._initializeClient()
      .then((maybeUserData) => {
        /** Set the new state, depending on the user data object */
        this.state.transact(() => (
          maybeUserData
            ? {
              isLoaded: true,
              hasAuth : true,
              userData: maybeUserData
            }
            : {
              isLoaded: true,
              hasAuth : false,
              userData: null
            }
        ));
      })
      .catch((error) => {
        this._initLogger.error('Unhandled exception occurred while initializing the Client', error);
      });
  }


  // ----
  // Internal methods
  // ----

  /**
   * Complete initialization process for this client instance.
   * The method will fail if the client has already been initialized,
   * else, if the client has the authorization token requested by the
   * getUserData api endpoint, it will try to load user data and return
   * to the caller function
   * @private
   */
  private async _initializeClient(): Promise<UserData | null> {
    /** Assert the client is loading */
    if (this.state.value.isLoaded) {
      throw new Error('Client has already been initialized.');
    }

    /** Use built in api to get user data, wrap into safe request to avoid unhandled error */
    const [ userDataError, userData ] = await will(this.getUserData());

    /** Assert no error occurred */
    if (userDataError) {
      this._initLogger.warn('Could not load user data on initialization', userDataError);
      return null;
    }

    /** Return loaded userdata */
    return userData;
  }


  /**
   * Use settings provided by 'requests' options key to build
   * a new Axios instance that could be used to perform request
   * to API BackEnd server
   * @param settings
   * @private
   */
  private _createAxiosInstance(settings: ClientSettings<UserData, StoredData, Tokens>['requests']): AxiosInstance {
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


  /**
   * When a new AuthResponse has been received from any authentication method,
   * the response will be passed to child TokenHandshakes instance to load
   * the necessary data and token.
   * The authentication method will be passed to let Handshake perform extra
   * validation or extraction depending on the method used.
   * @param authResponse
   * @param authAction
   * @private
   */
  private async _passAuthResponseToHandshakes(authResponse: any, authAction: AuthAction): Promise<void> {
    /** Create a promise pool with all extractions */
    const pool: Promise<void>[] = [];

    /** Get all handshakes */
    this._tokensHandshake.forEach((handshake) => {
      pool.push(handshake.extractTokenFromAuthResponse(authResponse, authAction));
    });

    /** Await the resolution of all extractors */
    await Promise.all(pool);
  }


  /**
   * Request a valid TokenHandshake using its name.
   * If the requested Handshake doesn't exists, an error will be thrown
   * @param name
   * @private
   */
  private _getTokenHandshake(name: Tokens): TokenHandshake<UserData, StoredData, Tokens> {
    /** Check the tokens handshake instance exists */
    const handshake = this._tokensHandshake.get(name);

    if (!handshake) {
      this._initLogger.error(`Token ${name} is need it to perform the request but the Handshake does not exist`);
      throw new Error(`Invalid token ${name}`);
    }

    return handshake;
  }


  /**
   * Get one of the built-in API methods configurations using its name.
   * If the method has not been configured, an error will be thrown
   * @param api
   * @private
   */
  private _builtInApi<K extends keyof ClientApi<UserData, StoredData, Tokens>>(api: K)
    : Exclude<ClientApi<UserData, StoredData, Tokens>[K], undefined> {
    /** Assert the Api has been defined */
    if (!this._settings.api?.[api]) {
      throw new Error(
        'Could not use login without configuring the API in \'config.api.login\' field'
      );
    }

    return this._settings.api[api] as Exclude<ClientApi<UserData, StoredData, Tokens>[K], undefined>;
  }


  // ----
  // Public Requests Methods
  // ----

  /**
   * Compile the request if is a function, else return
   * the request object if is plain
   * @param config
   */
  public compileRequest(config: ClientRequest<UserData, StoredData, Tokens>): ClientRequestConfig<Tokens> {
    return mergeObjects<ClientRequestConfig<Tokens>>(
      this._defaultsRequestConfig || {},
      typeof config === 'function' ? config(this) : config
    );
  }


  /**
   * Perform a request to BackEnd Server providing
   * the complete configuration object.
   * Response will be returned as Promise resolution,
   * if an error occurs within the request, must be
   * caught using a try-catch statement.
   * An abort Signal could be used to cancel request before completion
   * @param config
   * @param abortSignal
   */
  public async request<Response>(
    config: ClientRequest<UserData, StoredData, Tokens>,
    abortSignal?: GenericAbortSignal
  ): Promise<Response> {
    /** Assert the client has been loaded */
    if (!this._axios) {
      this._requestLogger.error('AxiosInstance is not ready. Check your configuration');
      throw new Error('Client has not been initialized');
    }

    /** Build request config, checking if is a function */
    const compiledRequest = this.compileRequest(config);

    const {
      url: initialUrl,
      method = 'GET',
      data,
      params,
      requestConfig,
      useTokens
    } = compiledRequest;

    /** Sanitize the URL and create the base AxiosRequestConfig */
    const url = Client.sanitizeUrl(initialUrl ?? '');
    const axiosRequestConfig: AxiosRequestConfig = {
      ...requestConfig,
      url,
      method,
      data,
      params,
      signal: abortSignal
    };

    this._requestLogger.debug('Created base AxiosRequestConfig from user request', compiledRequest);

    /** Use underlying axios instance to make the request */
    try {
      /** Check if some tokens must be appended to the request */
      if (isObject(useTokens)) {
        for (const tokenName of (Object.keys(useTokens) as Tokens[])) {
          /** Get the transporter */
          const transporter = useTokens[tokenName];

          if (transporter) {
            await this._getTokenHandshake(tokenName).appendToken(axiosRequestConfig, transporter);
          }
        }
      }

      /** Use underlying axios instance to make the request */
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


  /**
   * Perform a safe request to BackEnd server.
   * This async method will return an Array, with the
   * request error (if exists) at index 0, and the response
   * at index 1.
   * An abort Signal could be used to cancel request before completion
   * @param config
   * @param abortSignal
   */
  public async safeRequest<Response>(
    config: ClientRequest<UserData, StoredData, Tokens>,
    abortSignal?: GenericAbortSignal
  ): Promise<[ RequestError | null, Response ]> {
    const [ error, response ] = await will(this.request<Response>(config, abortSignal));

    if (error) {
      return [ RequestError.fromError(error), null as Response ];
    }

    return [ error, response ];
  }


  /* --------
   * Public Observable Methods
   * -------- */

  /**
   * Create an observable request and return the object
   * that could be used to subscribe to the result
   * @param config
   */
  public request$<Response>(config: ClientRequest<UserData, StoredData, Tokens>): Observable<Response> {
    return new Observable<Response>((observer) => (
      new RequestSubscriber<Response>(observer, (abortController) => (
        this.request(config, abortController.signal)
      ))
    ));
  }


  /**
   * Remove all references to client authorization from current Client instance
   */
  public flushAuth() {
    this.state.transact((curr) => ({
      ...curr,
      hasAuth : false,
      userData: null
    }));
  }


  /**
   * Get a token from the requested Handshake
   * @param name
   */
  public async getToken(name: Tokens): Promise<TokenSpecification> {
    return this._getTokenHandshake(name).getSpecification();
  }


  /**
   * Perform the login action
   * @param data
   */
  public async login(data: AnyObject): Promise<void> {
    /** Get the auth response */
    const authResponse = await this.request(this._builtInApi('login')(data));

    /** Pass the auth response to token handshakes */
    await this._passAuthResponseToHandshakes(authResponse, 'login');
  }


  /**
   * Perform the get user data internal api
   */
  public async getUserData(): Promise<UserData> {
    /** Get the auth response using the api configuration */
    return this.request<UserData>(this._builtInApi('getUserData')());
  }

}
