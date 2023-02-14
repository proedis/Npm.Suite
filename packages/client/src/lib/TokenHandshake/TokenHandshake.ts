import { Deferred, isObject, isValidString, will } from '@proedis/utils';

import type { Serializable } from '@proedis/types';

import type { AxiosRequestConfig } from 'axios';

import Emitter from '../Emitter/Emitter';
import Logger from '../../lib/Logger/Logger';
import Options from '../Options/Options';
import Storage from '../Storage/Storage';

import type Client from '../../Client';


import type {
  AuthAction,
  TokenAuthResponseExtractor,
  TokenSpecification,
  TokenHandshakeEvents,
  TokenHandshakeConfiguration,
  TokenQueryParamExtractor,
  TokenTransporter,
  UseTokenTransporter
} from './TokenHandshake.types';

import RequestError from '../../Client.RequestError';


export default class TokenHandshake<UserData extends Serializable, StoreData extends Serializable, Tokens extends string>
  extends Emitter<TokenHandshakeEvents> {

  // ----
  // Internal static field
  // ----
  private static _defaultTokenSpecification: Partial<TokenSpecification> = {
    expiresAt: undefined,
    token    : undefined
  };


  // ----
  // Private Instance Field
  // ----
  private readonly _client: Client<UserData, StoreData, Tokens>;

  private readonly _configuration: Options<TokenHandshakeConfiguration<UserData, StoreData, Tokens>>;

  private readonly _logger: Logger;

  private readonly _storage: Storage<Partial<TokenSpecification>>;

  private _getDeferred: Deferred<TokenSpecification> | undefined;


  // ----
  // TokenHandshake constructor
  // ----
  constructor(
    name: Tokens,
    configuration: TokenHandshakeConfiguration<UserData, StoreData, Tokens>,
    client: Client<UserData, StoreData, Tokens>
  ) {
    super(`TokenHandshake::${name}`);

    /** Configure the module */
    this._configuration = new Options<TokenHandshakeConfiguration<UserData, StoreData, Tokens>>(configuration);

    /** Create the logger */
    this._logger = Logger.forContext(`TokenHandshake::${name}`);

    this._logger.debug('Loading Module');

    /** Save Internal data */
    this._client = client;

    /** Create the internal persisted storage */
    this._storage = new Storage<Partial<TokenSpecification>>(
      `TokenHandshake::${name}`,
      'local',
      TokenHandshake._defaultTokenSpecification
    );

    this._logger.debug('Module Loaded');
  }


  // ----
  // Private Methods
  // ----

  /**
   * Initialize the Deferred instance object that could be used
   * to return a promise that will be resolved with the token when
   * it has been successfully loaded
   * @private
   */
  private _initializeDeferredPromise() {
    /** Assert is not pending */
    if (!this._getDeferred?.isPending) {
      this._logger.debug('Setting the Deferred promise to avoid multiple simultaneous requests');
      this._getDeferred = new Deferred<TokenSpecification>();
    }
  }


  /**
   * Save the token into local storage and resolve the
   * pending deferred object with the loaded token
   * @param specification
   * @private
   */
  private _consolidateToken(specification: TokenSpecification): TokenSpecification {
    this._logger.debug('Consolidating Token');

    /** Save the newly loaded token into internal storage */
    this._storage.transact(() => specification);

    /** Check the pending deferred request to resolve it */
    if (this._getDeferred?.isPending) {
      this._getDeferred.resolve(specification);
      this._getDeferred = undefined;
    }

    /** Return the consolidated token */
    return specification;
  }


  /**
   * Flush internal store token and reject the Deferred if it is pending
   * @param error
   * @private
   */
  private _flushToken(error?: RequestError | null): RequestError {
    this._logger.debug('Flushing Token');

    /** Remove the internal stored token specification */
    this._storage.transact(() => TokenHandshake._defaultTokenSpecification);

    /** Check the pending deferred request to reject it */
    if (this._getDeferred?.isPending) {
      this._getDeferred.reject(error);
      this._getDeferred = undefined;
    }

    /** Flush client auth based on configuration */
    if (this._configuration.getOrDefault('invalidateAuthOnGrantError', 'boolean', true)) {
      this._client.flushAuth();
    }

    /** Return error that could be thrown */
    return error ?? RequestError.fromError(new Error('Invalid Token Received'));
  }


  /**
   * Get a valid usable not expired token
   * @private
   */
  private async _retrieveValidToken(): Promise<TokenSpecification> {
    /** Set up the Deferred object */
    this._initializeDeferredPromise();


    // ----
    // Use token stored into local storage
    // ----
    if (this.isValid(this._storage.data)) {
      this._logger.debug('In Memory Token is valid');
      return this._consolidateToken(this._storage.data);
    }


    // ----
    // Extract the token from QueryParam of current Window Location URL
    // ----
    const queryParamExtractor = this._configuration
      .getOrDefault('extractors', 'array', [])
      .find((extractor) => extractor.type === 'query-param') as TokenQueryParamExtractor | undefined;

    if (queryParamExtractor && window.location.search) {
      /** Transform current search into URLSearchParams instance and get value */
      const urlSearchParams = new URLSearchParams(window.location.search);

      /** Build the token specification */
      const expiresAtValue = urlSearchParams.get(queryParamExtractor.extract.expiresAt) ?? undefined;
      const specification: Partial<TokenSpecification> = {
        token    : urlSearchParams.get(queryParamExtractor.extract.token) ?? undefined,
        expiresAt: expiresAtValue ?? undefined
      };

      /** Check if exists */
      if (this.isValid(specification)) {
        this._logger.debug('Token extracted from QueryParam key');

        /** Consolidate the token in memory */
        const consolidatedToken = this._consolidateToken(specification);

        /** Remove the query params string and replace the search params */
        urlSearchParams.delete(queryParamExtractor.extract.token);
        window.location.search = urlSearchParams.toString();

        /** Return consolidated token */
        return consolidatedToken;
      }
    }


    // ----
    // Grant Token using API Request
    // ----
    const grantRequest = this._configuration.get(
      'grant',
      (config) => (typeof config === 'object' && config != null) || typeof config === 'function'
    );

    if (grantRequest) {
      this._logger.debug('Using grant request to retrieve token');

      /** Make the Request */
      const [ grantTokenError, tokenResponse ] = await this._client.safeRequest<TokenSpecification>(grantRequest);

      /** Throw if an invalid request has been made */
      if (grantTokenError || !this.isValid(tokenResponse)) {
        this._logger.error('An error has been received from API when granting a new Token');

        /** Flush tokens */
        throw this._flushToken(grantTokenError);
      }

      /** Assert token response is valid */
      if (this.isValid(tokenResponse)) {
        return this._consolidateToken(tokenResponse);
      }
    }


    // ----
    // Reject as no able to load token
    // ----
    throw this._flushToken();
  }


  /**
   * Get an usable Transporter
   * @param type
   * @private
   */
  private _getTransporterConfiguration(type: UseTokenTransporter): TokenTransporter | null {
    /** Get all configured transporter */
    const transporters = this._configuration.getOrDefault('transporters', 'array', []);

    /** Return null if no transporters have been defined or type has not been requested */
    if (!transporters.length || type === false) {
      return null;
    }

    /** If using 'true' plain boolean, return default transporter or the first available */
    if (type === true) {
      return transporters.find(t => t.isDefault) ?? transporters[0];
    }

    /** Return transporter using type literal */
    return transporters.find(t => t.type === type) ?? null;
  }


  // ----
  // Public Methods
  // ----

  /**
   * Check the validity of a token specification object
   * @param specification
   */
  public isValid(specification?: Partial<TokenSpecification>): specification is TokenSpecification {
    /** Get user defined check validity function */
    const checkValidity = this._configuration.get('checkValidity', 'function');

    /** If a custom function exists, use it to validate token */
    if (checkValidity) {
      this._logger.debug('Using custom defined function to check token validity');
      return checkValidity(specification, this._client);
    }

    /** Assert the token is a valid object */
    if (typeof specification !== 'object' || specification === null) {
      this._logger.debug('Token seems not to be a valid object');
      return false;
    }

    /** Assert the token is a valid string */
    if (!isValidString(specification.token)) {
      this._logger.debug('Token string field seems not to be a valid string');
      return false;
    }

    /** If the token haven't got expire date, then would be considered not expiring */
    if (specification.expiresAt == null) {
      return true;
    }

    /** Transform the expiresAt using Date constructor */
    const expireDate = new Date(specification.expiresAt);

    /** Check expiring value */
    if ((expireDate.valueOf() - this._configuration.getOrDefault(
      'validityThreshold',
      'number',
      0
    )) > Date.now()) {
      return true;
    }

    this._logger.debug('Token is Expired');
    return false;
  }


  /**
   * Get a valid usable token using all methods
   * provided withing configuration
   */
  public async get(): Promise<TokenSpecification> {
    this._logger.info('Loading Token');

    /** Check if a deferred promise already exists, return the pending request */
    if (this._getDeferred && this._getDeferred.isPending) {
      this._logger.info('A deferred request for the Token already exists. Wait for it');
    }

    /** Return the deferred function or the defaults retrieve token function */
    return this._getDeferred?.promise ?? await this._retrieveValidToken();
  }


  /**
   * Append the Token to a Client Request
   * @param request
   * @param transporterType
   */
  public async appendToken(request: AxiosRequestConfig, transporterType: UseTokenTransporter) {
    /** Get the Transporter */
    const transporter = this._getTransporterConfiguration(transporterType);

    /** Assert Transporter exists */
    if (!transporter) {
      /** Show error only if a transporter was requested */
      if (transporterType !== false) {
        this._logger.error(
          `Requested transporter '${(transporterType === true ? 'DefaultTransporter' : transporterType)}' was not found`
        );

        throw new Error('Invalid Token');
      }

      return;
    }

    this._logger.debug(`Using transporter '${transporter.type}' to append Token to Request`);

    /** Get the Token */
    const [ tokenError, specification ] = await will(this.get());

    if (tokenError) {
      this._logger.error('Error while retrieving token to append', tokenError);
      throw tokenError;
    }

    if (!specification) {
      this._logger.error('Token has been get without errors, but no token exists');
      throw new Error('Invalid Token');
    }

    /** Append the Token */
    switch (transporter.type) {
      case 'bearer':
        if (!isObject(request.headers)) {
          request.headers = {};
        }

        request.headers.Authorization = `Bearer ${specification.token}`;
        break;

      case 'header':
        if (!isObject(request.headers)) {
          request.headers = {};
        }

        request.headers[transporter.value] = specification.token;
        break;

      case 'query':
        if (!isObject(request.params)) {
          request.params = {};
        }

        request.params[transporter.value] = specification.token;
        break;

      default:
        this._logger.error(`Invalid Transporter Type Found : ${(transporter as any).type}`);
    }
  }


  /**
   * Extract usable token from AuthResponse
   * @param authResponse
   * @param authAction
   */
  public async extractTokenFromAuthResponse(authResponse: any, authAction: AuthAction) {
    /** Get all auth response extractor */
    const extractors = this._configuration.getOrDefault('extractors', 'array', [])
      .filter(e => e.type === 'auth-response');

    /** If any extractors exist, use to get the token from response */
    (extractors as TokenAuthResponseExtractor[]).forEach((extractor) => {
      /** Get the token specification from response */
      const tokenSpecification = extractor.extract(authResponse, authAction, this._client);

      if (this.isValid(tokenSpecification)) {
        this._consolidateToken(tokenSpecification);
      }
    });
  }

}
