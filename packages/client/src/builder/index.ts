import type { AxiosRequestConfig } from 'axios';

import type { Serializable } from '@proedis/types';

import Client from '../Client';
import type { ClientApi, ClientRequestConfig, ServerData } from '../Client.types';

import type { LoggerOptions, LogLevel } from '../lib/Logger/Logger.types';
import type { EnvironmentDependentOptions } from '../lib/Options/Options.types';
import type { TokenHandshakeConfiguration } from '../lib/TokenHandshake/TokenHandshake.types';


/* --------
 * Internal Types
 * -------- */
type Builder<T, A = T> = T | ((current: A | undefined) => T);


/* --------
 * Client Builder Definition
 * -------- */
export default class ClientBuilder<
  UserData extends Serializable = {},
  StoredData extends Serializable = {},
  Tokens extends string = never
> {


  // ----
  // Private properties
  // ----

  private _storedData: Serializable = {};

  private _logger: LoggerOptions | undefined;

  private _server: EnvironmentDependentOptions<ServerData> | undefined;

  private _tokens = new Map<Tokens, TokenHandshakeConfiguration<UserData, StoredData, Tokens>>();

  private _api: ClientApi<UserData, StoredData, Tokens> = {};

  private _defaultRequest: ClientRequestConfig<Tokens> | undefined;

  private _axiosConfig: Partial<AxiosRequestConfig> | undefined;


  // ----
  // Builder Constructor
  // ----
  constructor(private readonly _appName: string) {
  }


  // ----
  // Public methods
  // ----


  /**
   * Set the logging level or entire logging options
   * @param options
   */
  public setLogging(options: Builder<LogLevel | LoggerOptions, LoggerOptions | undefined>)
    : ClientBuilder<UserData, StoredData, Tokens> {
    /** Build new options value */
    const newOptions = typeof options === 'function' ? options(this._logger) : options;

    /**
     * Assign options to the logger options object.
     * When a log level will be used, it will be set
     * independently of running environment
     */
    if (typeof newOptions === 'string') {
      this._logger = {
        enabled    : true,
        minLogLevel: newOptions
      };
    }
    else {
      this._logger = newOptions;
    }

    return this;
  }


  public withServer(
    options: Builder<EnvironmentDependentOptions<ServerData>, EnvironmentDependentOptions<ServerData> | undefined>
  ): ClientBuilder<UserData, StoredData, Tokens> {
    this._server = typeof options === 'function' ? options(this._server) : options;
    return this;
  }


  /**
   * Set the ClientBuilder UserData type.
   * This method is used to provide a shorthand
   * to change the current ClientBuilder generics type
   */
  public withUserData<T extends Serializable>(): ClientBuilder<T, StoredData, Tokens> {
    return this as any;
  }


  /**
   * Set the initial stored data and the data type.
   * This method could be used to provide initial data for Client instance
   * and at the same time infer the type of the StoredData
   * @param initialData
   */
  public withStoredData<T extends Serializable>(initialData: T): ClientBuilder<UserData, T, Tokens> {
    this._storedData = initialData;
    return this as any;
  }


  /**
   * Add the configuration to use a specific token.
   * If a configuration for the requested token already exists,
   * it will be passed to the configuration function to let
   * the user modify it
   * @param name
   * @param configuration
   */
  public withToken<T extends string>(
    name: T,
    configuration: Builder<TokenHandshakeConfiguration<UserData, StoredData, Tokens>>
  ): ClientBuilder<UserData, StoredData, Tokens | T> {
    /** Create a new configuration for the token */
    const currentConfiguration = this._tokens.get(name as any);
    const newConfiguration = typeof configuration === 'function' ? configuration(currentConfiguration) : configuration;

    /** Set the new configuration into the Map Object */
    this._tokens.set(name as any, newConfiguration);

    /** Return the client builder */
    return this as ClientBuilder<UserData, StoredData, Tokens | T>;
  }


  /**
   * Remove the configuration for a token
   * @param name
   */
  public withoutToken<T extends Tokens>(name: T): ClientBuilder<UserData, StoredData, Exclude<Tokens, T>> {
    this._tokens.delete(name);
    return this as any;
  }


  /**
   * Define request configuration for specific built-in api.
   * @param name
   * @param request
   */
  public defineApi<T extends keyof ClientApi<UserData, StoredData, Tokens>>(
    name: T,
    request: ClientApi<UserData, StoredData, Tokens>[T]
  ): ClientBuilder<UserData, StoredData, Tokens> {
    this._api[name] = request;
    return this;
  }


  /**
   * Remove the configuration for a specific built-in api
   * @param name
   */
  public removeApi<T extends keyof ClientApi<UserData, StoredData, Tokens>>(name: T)
    : ClientBuilder<UserData, StoredData, Tokens> {
    if (name in this._api) {
      delete this._api[name];
    }

    return this;
  }


  /**
   * Set the client defaults param.
   * If defaults params have already been set, they will be
   * passed to the option function to let the user edit them
   * @param configure
   */
  public withDefaults(configure: Builder<ClientRequestConfig<Tokens> | undefined>): ClientBuilder<UserData, StoredData, Tokens> {
    this._defaultRequest = typeof configure === 'function' ? configure(this._defaultRequest) : configure;
    return this;
  }


  /**
   * Set the Axios defaults param.
   * If defaults params have already been set, they will be
   * passed to the option function to let the user edit them
   * @param configure
   */
  public withAxiosDefault(
    configure: Builder<Partial<AxiosRequestConfig> | undefined>
  ): ClientBuilder<UserData, StoredData, Tokens> {
    this._axiosConfig = typeof configure === 'function' ? configure(this._axiosConfig) : configure;
    return this;
  }


  // ----
  // Client Builder
  // ----
  public build(): Client<UserData, StoredData, Tokens> {
    /** Assert server has been set */
    if (!this._server) {
      throw new Error('Server Settings aren\'t found');
    }

    /** Create tokens */
    const tokens: Partial<Record<Tokens, TokenHandshakeConfiguration<UserData, StoredData, Tokens>>> = {};

    this._tokens.forEach((configuration, name) => {
      tokens[name] = configuration;
    });

    /** Create the client */
    return new Client<UserData, StoredData, Tokens>(this._appName, {
      initialStorage: this._storedData as StoredData,
      logger        : this._logger,
      api           : this._api,
      requests      : {
        axiosConfig: this._axiosConfig,
        defaults   : this._defaultRequest,
        server     : this._server
      },
      tokens        : tokens as Record<Tokens, TokenHandshakeConfiguration<UserData, StoredData, Tokens>>
    });
  }

}
