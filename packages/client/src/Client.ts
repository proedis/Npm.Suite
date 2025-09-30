import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, GenericAbortSignal } from 'axios';

import { plainToInstance } from 'class-transformer';

import { Observable } from 'rxjs';

import type { AnyObject } from '@proedis/types';

import { Deferred, hasEqualHash, isNil, isObject, isValidString, mergeObjects, will, isBrowser } from '@proedis/utils';

import Logger from './lib/Logger/Logger';
import Options from './lib/Options/Options';
import Storage from './lib/Storage/Storage';
import TokenHandshake from './lib/TokenHandshake/TokenHandshake';

import type { LoggerOptions } from './lib/Logger/Logger.types';

import { BrowserStorageProvider } from './providers';

import RequestError from './Client.RequestError';

import type {
  AuthActionType,
  ClientApi,
  ClientSettings,
  ClientState,
  ClientRequest,
  ClientRequestConfig,
  ClientProviders,
  NonTransformableClientRequestConfig
} from './Client.types';

import type { TokenSpecification } from './lib/TokenHandshake/TokenHandshake.types';
import RequestSubscriber from './Client.RequestSubscriber';


/* --------
 * Client definition
 * -------- */
export default class Client<UserData extends AnyObject, StoredData extends AnyObject, Tokens extends string> {


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


  /**
   * Convert a base64 string into a Blob file.
   * This utility function could be used in browser only
   * @param base64Data Complete Base64 string, could contain data uri information
   * @param contentType The content type of the file, if not provided, it will be extracted from base64 is present
   * @param sliceSize Slice size used to aggregate bytes
   */
  public static blobFromBase64(base64Data: string, contentType: string | null, sliceSize: number = 512): Blob {
    /** Check code is running on browser */
    if (!isBrowser) {
      throw new Error('Client.blobFromBase64 method could be used only on Browser');
    }

    /**
     * Safe convert the base64Data, extracting information from string.
     * A data URI base64 contains information like 'data:image/png;base64,'
     * The real content of the Base64 type is placed after the comma.
     */
    const [ dataUri, content ] = base64Data.indexOf(',') !== -1
      ? base64Data.split(',')
      : [ undefined, base64Data ];

    /** Compute the content type, if not provided */
    const fileContentType = (() => {
      /** Use the user-defined content type if provided */
      if (typeof contentType === 'string') {
        return contentType;
      }

      /** Extract the content type from match */
      const matches = (dataUri || '').match(/:(.*);/);

      if (matches) {
        return matches[1];
      }

      /** Fallback to the generic type */
      return 'application/octet-stream';
    })();

    /** Create the blob from content */
    const binaryString = window.atob(content);

    /** Create the blob using right ContentType */
    const byteArrays = [];

    for (let offset = 0; offset < binaryString.length; offset += sliceSize) {
      const slice = binaryString.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: fileContentType });
  }


  /**
   * Easily transform any plain JavaScript object into a FormData instance.
   * If existing form data is provided through arguments, new data will be
   * appended to existing form data instead of creating a new one
   */
  public static toFormData(object: any, formData: FormData = new FormData(), parentKey?: string): FormData {
    /** Initialize a checker to get if function is executing on ReactNative platform */
    const isReactNative = typeof (formData as any).getParts === 'function';

    /** Initialize a function to check if a value is a Blob */
    const isBlob = (value: any) => (
      isReactNative
        ? (isObject(value) && value.uri !== undefined)
        : (isObject(value) && value instanceof Blob)
    );

    /** Undefined object will be skipped */
    if (object === undefined) {
      return formData;
    }

    /** Null objects are treated as empty data */
    if (object === null) {
      if (typeof parentKey === 'string') {
        formData.append(parentKey, '');
      }
      return formData;
    }

    /** Boolean value will be converted to string */
    if (typeof object === 'boolean' && typeof parentKey === 'string') {
      formData.append(parentKey, object.toString());
      return formData;
    }

    /** If the object is an Array, loop through each value */
    if (Array.isArray(object) && typeof parentKey === 'string') {
      if (!!object.length) {
        object.forEach((item, index) => {
          /** Create the key based on item index */
          const key = `${parentKey}[${index}]`;
          /** Serialize entire item using recursion */
          Client.toFormData(item, formData, key);
        });
      }
      return formData;
    }

    /** Update date transforming into conventional ISO string */
    if (object instanceof Date && typeof parentKey === 'string') {
      formData.append(parentKey, object.toISOString());
      return formData;
    }

    /** Serialize nested objects, only if not Blob file */
    if (isObject(object) && !isBlob(object)) {
      Object.keys(object).forEach((key) => {
        Client.toFormData(object[key], formData, typeof parentKey === 'string' ? `${parentKey}.${key}` : key);
      });
      return formData;
    }

    /** Append the value as is and return */
    if (typeof parentKey === 'string') {
      formData.append(parentKey, object);
    }

    return formData;
  }


  // ----
  // Static constant properties
  // ----
  private static _defaultClientState: ClientState<any> = {
    isReady : false,
    isLoaded: false,
    hasAuth : false,
    userData: null
  };

  private static _defaultLoggingOptions: LoggerOptions = {
    enabled    : {
      development: true,
      staging    : true,
      production : false
    },
    minLogLevel: {
      development: 'warn',
      staging    : 'warn',
      production : 'none'
    }
  };


  // ----
  // Internal properties
  // ----
  private readonly _axios: AxiosInstance;

  private _clientInitializationDeferred: Deferred<UserData | null> | undefined;

  private readonly _defaultsRequestConfig: NonTransformableClientRequestConfig<Tokens> | undefined;

  private readonly _initLogger: Logger;

  private readonly _requestLogger: Logger;

  private readonly _providers: ClientProviders;

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
    const loggerSettings = new Options(_settings.logger || Client._defaultLoggingOptions);
    Logger.configure({
      enabled    : loggerSettings.getOrDefault('enabled', 'boolean', true),
      minLogLevel: loggerSettings.getOrDefault('minLogLevel', 'string', 'warn')
    });

    /** Create the internal logger instance */
    this._initLogger = Logger.forContext('Initializing');
    this._requestLogger = Logger.forContext('Requests');

    /** Save defined providers */
    this._providers = {
      storage: this._settings.providers?.storage || BrowserStorageProvider()
    };

    /** Create the internal persistent storage for the client */
    this.storage = new Storage<StoredData>(
      'ClientStore',
      'local',
      _settings.initialStorage,
      this._providers.storage
    );

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
    this.state = new Storage<ClientState<UserData>>(
      'State',
      'page',
      Client._defaultClientState,
      this._providers.storage
    );

    /** Initialize the client */
    this._initializeClient()
      .then((userData) => {
        return this._updateUserData(userData);
      })
      .catch((error) => {
        this._initLogger.error('Unhandled exception occurred while initializing the Client', error);
      })
      .finally(() => this.state.set('isLoaded', true));
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

    /** Build an internal function to return and resolve initialization defer */
    const returnAndResolve = (result: UserData | null): UserData | null => {
      this._clientInitializationDeferred?.resolve(result);
      this._clientInitializationDeferred = undefined;
      return result;
    };

    /** Check if current auth and state must be invalidated, using initialization defined function */
    if (typeof this._settings.extras?.invalidateExistingAuth === 'function') {
      if (this._settings.extras.invalidateExistingAuth(this)) {
        await this.flushAuth();
      }
    }

    /** Await the initialization of all the storage module */
    await this.state.isInitialized();
    await this.storage.isInitialized();
    await Promise.all(Array.from(this._tokensHandshake.values()).map(t => t.isInitialized()));

    /** Set the client as ready to be used */
    await this.state.set('isReady', true);

    /** Assert the client is loading */
    if (this.state.value.isLoaded) {
      return returnAndResolve(this.state.value.userData);
    }

    /** Use built in api to get user data, wrap into safe request to avoid unhandled error */
    const [ userDataError, userData ] = await this.safeRequest<UserData>(this._builtInApi('getUserData')());

    /** Assert no error occurred */
    if (userDataError) {
      this._initLogger.error('UserData could not be loaded, assuming client is unauthenticated', userDataError);
      return returnAndResolve(null);
    }

    /** Return loaded userdata */
    return returnAndResolve(userData);
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
  private async _updateUserData(userData: UserData | null) {
    return this.state.transact((curr) => (
      userData
        ? {
          ...curr,
          hasAuth : true,
          userData: userData
        }
        : {
          ...curr,
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
  private async _passAuthResponseToHandshakes(authResponse: any, authAction: AuthActionType): Promise<void> {
    /** Complete process for all TokenHandshake */
    await Promise.all(Array.from(this._tokensHandshake.values()).map(t => (
      t.extractTokenFromAuthResponse(authResponse, authAction)
    )));
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
  // Public Getters
  // ----

  /**
   * Return the baseUrl used by the internal axios instance
   * to perform http requests
   */
  public get baseUrl(): string {
    const { baseURL } = this._axios.defaults;

    if (!baseURL) {
      throw new Error('client.baseUrl is unusable because no URL has been set.');
    }

    return baseURL;
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


  /**
   * Manual and explicit set a token
   * @param name
   * @param specification
   */
  public async setToken(name: Tokens, specification: TokenSpecification): Promise<void> {
    /** Get the requested token handshake from the pool */
    await this._getTokenHandshake(name).setExplicit(specification);
  }


  /**
   * Force the reload of the current Client instance
   */
  public async forceReload(): Promise<UserData | null> {
    /** Restore the client state, removing saved user data and setting starting state */
    await this.state.transact((curr) => ({
      ...Client._defaultClientState,
      isReady: curr.isReady
    }));

    /** Restart the Client Initialization Process */
    const [ initializeError, userData ] = await will(this._initializeClient());

    /** If an error occurred has to be considered an Unhandled exception */
    if (initializeError) {
      this._initLogger.error('Unhandled exception occurred while reloading the Client', initializeError);
      return null;
    }

    /** Save the new state with loaded user data */
    await this._updateUserData(userData);

    /** Change the isLoaded state to be true */
    await this.state.set('isLoaded', true);

    /** Return loaded user data */
    return userData;
  }


  /**
   * Get one of the Client Providers
   * @param provider
   */
  public getProvider<T extends keyof ClientProviders>(provider: T): ClientProviders[T] {
    return this._providers[provider];
  }


  /**
   * Return an instantiated TokenHandshake
   * @param token
   */
  public getTokenHandshake(token: Tokens): TokenHandshake<UserData, StoredData, Tokens> {
    /** Load the Handshake from Map */
    const handshake = this._tokensHandshake.get(token);

    /** Assert it exists before return */
    if (!handshake) {
      throw new Error(`Requested TokenHandshake '${token}' does not exists`);
    }

    return handshake;
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
   * Using a request configuration, compile and return the url to call
   * @param config
   */
  public createUrl(config: ClientRequest<UserData, StoredData, Tokens, any>): string {
    /** Compile the request to create the url */
    const compiledRequest = this.compileRequest(config);

    /** Extract useful data */
    const {
      url: initialUrl,
      params
    } = compiledRequest;

    /** Create the base url */
    const url = `${this.baseUrl}/${Client.sanitizeUrl(initialUrl || '')}`;

    if (!params) {
      return url.toString();
    }

    /** Create the search params */
    const searchParams = new URLSearchParams(params);

    return `${url}?${searchParams}`;
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
      params,
      signal: abortSignal
    };

    /** Compile the data to send if the request differs from 'GET' */
    if (method.toUpperCase() !== 'GET' && ('data' in compiledRequest || 'files' in compiledRequest)) {
      /** Extract the data and the file object from config */
      const { data, files, formData: forceFormDataRequest } = compiledRequest;

      /** Check if the request must be sent as FormData */
      if (!isNil(files) || forceFormDataRequest) {
        /** Create the form data objects */
        const formData = data && data instanceof FormData ? data : new FormData();

        /** If data is not a FormData object, add all keys to the new object */
        if (data && !(data instanceof FormData)) {
          Client.toFormData(data, formData);
        }

        /** Compile the file to upload within the FormData */
        Object.entries(files || {}).forEach(([ field, filesEntry ]) => {
          (Array.isArray(filesEntry) ? filesEntry : [ filesEntry ]).forEach((file) => {
            /** Append to form data if the file is already a blob */
            if (file instanceof Blob) {
              formData.append(field, file, field);
            }
            /** Else, if the file is an uri referred file, append as is */
            else if ('uri' in file) {
              formData.append(field, file as any, file.name || field);
            }
            /** Else, if a base64 string exists, convert to blob */
            else if ('base64' in file) {
              formData.append(field, Client.blobFromBase64(file.base64, file.type), file.name || field);
            }
          });
        });

        /** Add the new form data to axios request config */
        axiosRequestConfig.data = formData;
      }
      else {
        axiosRequestConfig.data = data;
      }
    }

    /** Set the right header while sending data as FormData */
    if (axiosRequestConfig.data && axiosRequestConfig.data instanceof FormData && !(axiosRequestConfig.headers?.['Content-Type'])) {
      axiosRequestConfig.headers = {
        ...axiosRequestConfig.headers,
        ['Content-Type']: 'multipart/form-data'
      };
    }

    this._requestLogger.debug('Created base AxiosRequestConfig from user request', compiledRequest);

    /** Use the underlying axios instance to make the request */
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

      this._requestLogger.debug(`Performing a ${method} request to ${url}`, axiosRequestConfig);

      /** Await for the response */
      const response = (await this._axios(axiosRequestConfig)) as AxiosResponse<Response>;

      this._requestLogger.debug(`Received response from ${url}`, response);

      return transformer
        ? plainToInstance(transformer, response.data) as Response
        : response.data;
    }
    catch (error) {
      /** Error message will be shown only once the client is fully loaded */
      if (this.state.value.isLoaded) {
        this._requestLogger.error(`Error received from ${url}`, error);
      }

      /** Throw the error as RequestError object */
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
  public async flushAuth() {
    /** Flush the authorization and clear all tokens */
    await Promise.all(Array.from(this._tokensHandshake.values()).map(t => t.clear()));

    /** Remove user data object from current client state */
    await this._updateUserData(null);
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
    await this._passAuthResponseToHandshakes(authResponse, 'login');

    /** Pass the auth response to user data extractor */
    const userData = this._extractUserData(authResponse, 'login');

    /** Update the client state */
    await this._updateUserData(userData);
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
    await this._passAuthResponseToHandshakes(authResponse, 'signup');

    /** Pass the auth response to user data extractor */
    const userData = this._extractUserData(authResponse, 'signup');

    /** Update the client state */
    await this._updateUserData(userData);
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
    await this.flushAuth();
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
    await this._updateUserData(userData);

    /** Return loaded user data */
    return userData;
  }

}
