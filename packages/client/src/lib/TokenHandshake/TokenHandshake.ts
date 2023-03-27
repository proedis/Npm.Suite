import { Deferred, isObject, isValidString, will } from '@proedis/utils';

import type { Serializable } from '@proedis/types';

import type { AxiosRequestConfig } from 'axios';

import Logger from '../../lib/Logger/Logger';
import Options from '../Options/Options';
import Storage from '../Storage/Storage';

import type Client from '../../Client';
import type { AuthActionType } from '../../Client.types';

import type {
  TokenAuthResponseExtractor,
  TokenSpecification,
  TokenHandshakeConfiguration,
  TokenQueryParamExtractor,
  TokenPlainExtractor,
  TokenTransporter,
  UseTokenTransporter
} from './TokenHandshake.types';

import RequestError from '../../Client.RequestError';


export default class TokenHandshake<UserData extends Serializable, StoreData extends Serializable, Tokens extends string>
  extends Storage<Partial<TokenSpecification>> {

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

  private readonly _handshakeLogger: Logger;

  private _getDeferred: Deferred<TokenSpecification> | undefined;


  // ----
  // TokenHandshake constructor
  // ----
  constructor(
    private readonly _name: Tokens,
    configuration: TokenHandshakeConfiguration<UserData, StoreData, Tokens>,
    client: Client<UserData, StoreData, Tokens>
  ) {
    super(`TokenHandshake::${_name}`, configuration.persistency ?? 'local', TokenHandshake._defaultTokenSpecification);

    /** Configure the module */
    this._configuration = new Options<TokenHandshakeConfiguration<UserData, StoreData, Tokens>>(configuration);

    /** Create the logger */
    this._handshakeLogger = Logger.forContext(`TokenHandshake::${_name}`);

    /** Save Internal data */
    this._client = client;

    this._handshakeLogger.debug('Module Loaded');
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
      this._handshakeLogger.debug('Setting the Deferred promise to avoid multiple simultaneous requests');
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
    this._handshakeLogger.debug('Consolidating Token');

    /** Save the newly loaded token into internal storage */
    this.transact(() => specification);

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
    this._handshakeLogger.debug('Flushing Token');

    /** Clear the tokens */
    this.clear();

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
    if (this.isValid(this.value)) {
      this._handshakeLogger.debug('In Memory Token is valid');
      return this._consolidateToken(this.value);
    }


    // ----
    // Get all Tokens defined Extractors
    // ----
    const tokenExtractors = this._configuration
      .getOrDefault('extractors', 'array', []);


    // ----
    // Extract the token from QueryParam of current Window Location URL
    // ----
    const queryParamExtractor = tokenExtractors
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
        this._handshakeLogger.debug('Token extracted from QueryParam key');

        /** Consolidate the token in memory */
        const consolidatedToken = this._consolidateToken(specification);

        /**
         * Remove the query params string and replace the search params.
         * This behaviour occurs only if the token must be kept 'private',
         * this will not completely hide the token, but will be removed from
         * query parameters
         */
        if (queryParamExtractor.hideWhenExtracted) {
          urlSearchParams.delete(queryParamExtractor.extract.token);
          window.location.search = urlSearchParams.toString();
        }

        /** Return consolidated token */
        return consolidatedToken;
      }
    }


    // ----
    // Use the plain extractor if exists
    // ----
    const plainExtractor = tokenExtractors
      .find((extractor) => extractor.type === 'plain') as TokenPlainExtractor | undefined;

    if (plainExtractor && plainExtractor.extract !== false) {
      this._handshakeLogger.debug('Get token from the plain specification object');

      /** Consolidate the token in memory and return it */
      return this._consolidateToken(plainExtractor.extract);
    }


    // ----
    // Grant Token using API Request
    // ----
    const grantRequest = this._configuration.get(
      'grant',
      (config) => (typeof config === 'object' && config != null) || typeof config === 'function'
    );

    if (grantRequest) {
      this._handshakeLogger.debug('Using grant request to retrieve token');

      /** Compile the grant request before send to the client to remove the current token from request */
      const compiledRequest = this._client.compileRequest(grantRequest);

      /** Remove current token from useToken object */
      if (isObject(compiledRequest.useTokens)) {
        compiledRequest.useTokens[this._name] = false;
      }

      /** Make the Request */
      const [ grantTokenError, tokenResponse ] = await this._client.safeRequest<TokenSpecification>(compiledRequest);

      /** Throw if an invalid request has been made */
      if (grantTokenError || !this.isValid(tokenResponse)) {
        this._handshakeLogger.error('An error has been received from API when granting a new Token');

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
   * Remove token stored internally and into local storage.
   * Calling this api alone will only remove single handshake tokens,
   * but won't flush the original client's authentication.
   */
  public clear() {
    /** Remove the internal stored token specification */
    this.transact(() => TokenHandshake._defaultTokenSpecification);

    /** Check the pending deferred request to reject it */
    if (this._getDeferred?.isPending) {
      this._getDeferred.reject();
      this._getDeferred = undefined;
    }
  }


  /**
   * Check the validity of a token specification object
   * @param specification
   */
  public isValid(specification?: Partial<TokenSpecification>): specification is TokenSpecification {
    /** Get user defined check validity function */
    const checkValidity = this._configuration.get('checkValidity', 'function');

    /** If a custom function exists, use it to validate token */
    if (checkValidity) {
      this._handshakeLogger.debug('Using custom defined function to check token validity');
      return checkValidity(specification, this._client);
    }

    /** Assert the token is a valid object */
    if (typeof specification !== 'object' || specification === null) {
      this._handshakeLogger.debug('Token seems not to be a valid object');
      return false;
    }

    /** Assert the token is a valid string */
    if (!isValidString(specification.token)) {
      this._handshakeLogger.debug('Token string field seems not to be a valid string');
      return false;
    }

    /** If the token haven't got expire date, then would be considered not expiring */
    if (specification.expiresAt == null) {
      return true;
    }

    /** Transform the expiresAt using Date constructor */
    const expireDate = new Date(specification.expiresAt);

    /** Check expiring value */
    if ((expireDate.valueOf() - this._configuration.getOrDefault('validityThreshold', 'number', 0)) > Date.now()) {
      return true;
    }

    this._handshakeLogger.debug('Token is Expired');
    return false;
  }


  /**
   * Explicit set a token to use, providing complete specification
   * @param specification
   */
  public setExplicit(specification: TokenSpecification): TokenSpecification {
    return this._consolidateToken(specification);
  }


  /**
   * Get a valid usable token using all methods
   * provided withing configuration
   */
  public async getSpecification(): Promise<TokenSpecification> {
    this._handshakeLogger.info('Loading Token');

    /** Check if a deferred promise already exists, return the pending request */
    if (this._getDeferred && this._getDeferred.isPending) {
      this._handshakeLogger.info('A deferred request for the Token already exists. Wait for it');
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
        this._handshakeLogger.error(
          `Requested transporter '${(transporterType === true ? 'DefaultTransporter' : transporterType)}' was not found`
        );

        throw new Error('Invalid Token');
      }

      return;
    }

    this._handshakeLogger.debug(`Using transporter '${transporter.type}' to append Token to Request`);

    /** Get the Token */
    const [ tokenError, specification ] = await will(this.getSpecification());

    if (tokenError) {
      this._handshakeLogger.error('Error while retrieving token to append', tokenError);
      throw tokenError;
    }

    if (!specification) {
      this._handshakeLogger.error('Token has been get without errors, but no token exists');
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
        this._handshakeLogger.error(`Invalid Transporter Type Found : ${(transporter as any).type}`);
    }
  }


  /**
   * Extract usable token from AuthResponse
   * @param authResponse
   * @param authAction
   */
  public extractTokenFromAuthResponse(authResponse: any, authAction: AuthActionType) {
    /** Get all auth response extractor */
    const extractors = this._configuration.getOrDefault('extractors', 'array', [])
      .filter(e => e.type === 'auth-response');

    /** If any extractors exist, use to get the token from response */
    (extractors as TokenAuthResponseExtractor<any>[]).forEach((extractor) => {
      /** Get the extractor configuration */
      const extract = typeof extractor.extract === 'function' ? extractor.extract : extractor.extract[authAction];

      /** Assert the extractor exists before use it */
      if (typeof extract !== 'function') {
        return;
      }

      /** Get the token specification from response */
      const tokenSpecification = extract(authResponse, authAction, this._client);

      if (this.isValid(tokenSpecification)) {
        this._consolidateToken(tokenSpecification);
      }
    });
  }

}
