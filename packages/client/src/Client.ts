import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, GenericAbortSignal } from 'axios';

import { plainToInstance } from 'class-transformer';

import { Observable } from 'rxjs';

import type { AnyObject, Serializable } from '@proedis/types';

import { Deferred, hasEqualHash, isNil, isObject, isValidString, mergeObjects, will } from '@proedis/utils';

import Logger from './lib/Logger/Logger';
import Options from './lib/Options/Options';
import Storage from './lib/Storage/Storage';
import TokenHandshake from './lib/TokenHandshake/TokenHandshake';

import RequestError from './Client.RequestError';

import type {
  AuthActionType,
  ClientApi,
  ClientSettings,
  ClientState,
  ClientRequest,
  ClientRequestConfig,
  NonTransformableClientRequestConfig
} from './Client.types';

import type { TokenSpecification } from './lib/TokenHandshake/TokenHandshake.types';
import RequestSubscriber from './Client.RequestSubscriber';


/* --------
 * Client definition
 * -------- */
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

  private _clientInitializationDeferred: Deferred<UserData | null> | undefined;

  private readonly _defaultsRequestConfig: NonTransformableClientRequestConfig<Tokens> | undefined;

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
      .then(this._unconditionallySetState.bind(this))
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
    /** Check an initialization process is not running yet */
    if (this._clientInitializationDeferred) {
      return this._clientInitializationDeferred.promise;
    }

    /** Create the deferred promise to use to load user data */
    this._clientInitializationDeferred = new Deferred<UserData | null>();

    /** Check if current auth and state must be invalidated, using initialization defined function */
    if (typeof this._settings.extras?.invalidateExistingAuth === 'function') {
      if (this._settings.extras.invalidateExistingAuth(this)) {
        this.flushAuth();
      }
    }

    /** Assert the client is loading */
    if (this.state.value.isLoaded) {
      return this.state.value.userData;
    }

    /** Use built in api to get user data, wrap into safe request to avoid unhandled error */
    const [ userDataError, userData ] = await will(this.request<UserData>(this._builtInApi('getUserData')()));

    /** Assert no error occurred */
    if (userDataError) {
      this._initLogger.warn('Could not load user data on initialization', userDataError);
      return null;
    }

    /** Resolve the deferred promise */
    this._clientInitializationDeferred.resolve(userData);

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

    /**
     * In some system, the Axios module will be imported using 'default', try to assert the create function exists
     * Take this code as an experimental work-around
     */
    const createAxios = typeof (axios as unknown as { default?: typeof axios }).default?.create === 'function'
      ? (axios as unknown as { default?: typeof axios }).default!.create
      : axios.create;

    /** Return the Axios Instance */
    return createAxios({
      ...settings.axiosConfig,
      baseURL       : urlParts,
      timeout       : serverSettings.getOrDefault('timeout', 'number', 30_000),
      validateStatus: (status) => status >= 200 && status < 300
    });
  }


  /**
   * This method will unconditionally set the state as loaded,
   * and based on the user data presence or not, will save
   * if the auth has been granted or not
   * @param userData
   * @private
   */
  private _unconditionallySetState(userData: UserData | null) {
    this.state.transact(() => (
      userData
        ? {
          isLoaded: true,
          hasAuth : true,
          userData: userData
        }
        : {
          isLoaded: true,
          hasAuth : false,
          userData: null
        }
    ));
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
  private _passAuthResponseToHandshakes(authResponse: any, authAction: AuthActionType): void {
    /** Get all handshakes */
    this._tokensHandshake.forEach((handshake) => {
      handshake.extractTokenFromAuthResponse(authResponse, authAction);
    });
  }


  /**
   * After performing and auth action like 'login' or 'signup', the received response
   * will be passed to this method to extract the user data.
   * Having user data saved internally is mandatory for a client to be authenticated
   * or not
   * @param authResponse
   * @param authAction
   * @private
   */
  private _extractUserData(authResponse: any, authAction: AuthActionType): UserData | null {
    /** Get the extractor from settings */
    const extract = !!this._settings.userDataExtractor
      ? (typeof this._settings.userDataExtractor === 'function'
        ? this._settings.userDataExtractor
        : this._settings.userDataExtractor[authAction])
      : undefined;

    /** Assert the extractor has been defined */
    if (!extract) {
      this._initLogger.warn(`No user data extractor has been defined for '${authAction}' action`);
      return null;
    }

    /** Return extracted data */
    return extract(authResponse, authAction, this);
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
        `Could not use '${api}' without configuring the API in 'config.api.${api}' field`
      );
    }

    return this._settings.api[api] as Exclude<ClientApi<UserData, StoredData, Tokens>[K], undefined>;
  }


  // ----
  // Public Reconfiguration Methods
  // ----

  /**
   * Add (or remove) a default Header that will be used
   * for each client request
   * @param name
   * @param value
   */
  public useHeader(
    name: string,
    value: string | string[] | number | boolean | null
  ): Client<UserData, StoredData, Tokens> {
    /** If a null value has been provided, remove the header */
    if (isNil(value)) {
      if (name in this._axios.defaults.headers) {
        delete this._axios.defaults.headers[name];
      }

      return this;
    }

    /** Add the new header to defaults */
    this._axios.defaults.headers[name] = value;

    return this;
  }


  // ----
  // Public Requests Methods
  // ----

  /**
   * Compile the request if is a function, else return
   * the request object if is plain
   * @param config
   */
  public compileRequest<R>(config: ClientRequest<UserData, StoredData, Tokens, R>): ClientRequestConfig<Tokens, R> {
    return mergeObjects<ClientRequestConfig<Tokens, R>>(
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
    config: ClientRequest<UserData, StoredData, Tokens, Response>,
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
      transformer,
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

      return transformer
        ? plainToInstance(transformer, response.data) as Response
        : response.data;
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
    config: ClientRequest<UserData, StoredData, Tokens, Response>,
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
  public request$<Response>(config: ClientRequest<UserData, StoredData, Tokens, Response>): Observable<Response> {
    return new Observable<Response>((observer) => (
      new RequestSubscriber<Response>(observer, (abortController) => (
        this.request(config, abortController.signal)
      ))
    ));
  }


  /**
   * Remove all references to client authorization from the current Client instance,
   * and additionally remove all the tokens loaded
   */
  public flushAuth() {
    /** Flush the authorization and clear all tokens */
    this._tokensHandshake.forEach((handshake) => {
      handshake.clear();
    });

    /** Remove user data object from current client state */
    this._unconditionallySetState(null);
  }


  /**
   * Get a token from the requested Handshake.
   * If the current internal stored token doesn't exist, this method
   * will perform the entire chain to get a new valid token.
   * @param name
   */
  public async getToken(name: Tokens): Promise<TokenSpecification> {
    return this._getTokenHandshake(name).getSpecification();
  }


  /**
   * Perform the login action.
   * After a login request has been resolved successfully, the client
   * will try to extract tokens and user data from the response,
   * after it will reload the state
   * @param data
   */
  public async login(data: AnyObject): Promise<void> {
    /** Get the auth response */
    const authResponse = await this.request(this._builtInApi('login')(data));

    /** Pass the auth response to token handshakes */
    this._passAuthResponseToHandshakes(authResponse, 'login');

    /** Pass the auth response to user data extractor */
    const userData = this._extractUserData(authResponse, 'login');

    /** Update the client state */
    this._unconditionallySetState(userData);
  }


  /**
   * Perform the signup action.
   * After a signup request has been resolved successfully, the client
   * will try to extract tokens and user data from the response,
   * after it will reload the state
   * @param data
   */
  public async signup(data: AnyObject): Promise<void> {
    /** Get the auth response */
    const authResponse = await this.request(this._builtInApi('signup')(data));

    /** Pass the auth response to token handshakes */
    this._passAuthResponseToHandshakes(authResponse, 'signup');

    /** Pass the auth response to user data extractor */
    const userData = this._extractUserData(authResponse, 'signup');

    /** Update the client state */
    this._unconditionallySetState(userData);
  }


  /**
   * Perform the logout action.
   * This method will try to call the logout built in api only if it exists,
   * and after will flush all tokens and the internal authorization
   */
  public async logout(): Promise<void> {
    /** Check if an api has been configured to be call on logout */
    if (typeof this._settings.api?.logout === 'function') {
      await this.request(this._builtInApi('logout')());
    }

    /** Flush the client authorization */
    this.flushAuth();
  }


  /**
   * Use the internal built-in api to reload user data
   * from backend server, and the update the internal state.
   * Pay attention, if the server responds with an error,
   * or if the user data don't exist, the client will flush current authorization
   */
  public async getUserData(): Promise<UserData> {
    /** Get the auth response using the api configuration */
    const userData = await this.request<UserData>(this._builtInApi('getUserData')());

    /** Update the client state */
    this._unconditionallySetState(userData);

    /** Return loaded user data */
    return userData;
  }

}
