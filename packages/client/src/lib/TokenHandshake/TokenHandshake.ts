import { Deferred, isBrowser, isObject, isValidString, will } from '@proedis/utils';

import type { AnyObject } from '@proedis/types';

import type { TransportRequestConfig } from '../Transport/Transport.types';

import Logger from '../../lib/Logger/Logger';
import Options from '../Options/Options';
import Storage from '../Storage/Storage';

import type Client from '../../Client';
import type { AuthActionType } from '../../Client.types';

import type {
  TokenAuthResponseExtractor,
  TokenGrantResponseExtractor,
  TokenSpecification,
  TokenHandshakeConfiguration,
  TokenQueryParamExtractor,
  TokenPlainExtractor,
  TokenTransporter,
  UseTokenTransporter,
  TokenExtractor
} from './TokenHandshake.types';

import RequestError from '../../Client.RequestError';


export default class TokenHandshake<UserData extends AnyObject, StoreData extends AnyObject, Tokens extends string>
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
    super(
      `TokenHandshake::${_name}`,
      configuration.persistency ?? 'local',
      TokenHandshake._defaultTokenSpecification,
      client.getProvider('storage')
    );

    /** Configure the module */
    this._configuration = new Options<TokenHandshakeConfiguration<UserData, StoreData, Tokens>>(configuration);

    /** Create the logger */
    this._handshakeLogger = Logger.forContext(`TokenHandshake::${_name}`);

    /** Save Internal data */
    this._client = client;

    /** Preload plain token */
    this._preloadPlainToken()
      .then(() => {
        this._handshakeLogger.debug('Module Loaded');
      });
  }


  // ----
  // Private Methods
  // ----

  /**
   * Get all token extractors
   * @private
   */
  private _getTokenExtractors(): TokenExtractor<any, Tokens>[] {
    return this._configuration.getOrDefault('extractors', 'array', []);
  }


  /**
   * Try to preload a token using a plain extractor
   * if has been defined ad if is valid
   * @private
   */
  private async _preloadPlainToken() {
    /** Get token plain extractors */
    const plainExtractor = this._getTokenExtractors()
      .find((extractor) => extractor.type === 'plain') as TokenPlainExtractor | undefined;

    /** Check the extractor exists before continue */
    if (!plainExtractor || plainExtractor.extract === false) {
      return;
    }

    /** Preload the token */
    this._handshakeLogger.debug('Preloading token using plain extractor');

    return this._consolidateToken(plainExtractor.extract);
  }


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
      /** Create the new Deferred Object */
      this._getDeferred = new Deferred<TokenSpecification>();
      /** Attach a catcher to ensure at least one observer has been set and avoid Uncaught errors */
      this._getDeferred.promise.catch(() => {
        this._handshakeLogger.debug('Rejected Promise');
      });
    }
  }


  /**
   * If a deferred promise exists, and is still waiting for the resolution resolve it and unload
   * @param specification
   * @private
   */
  private _resolveDeferredPromise(specification: TokenSpecification) {
    /** Assert the deferred object exists */
    if (this._getDeferred) {
      /** Resolve if it is pending */
      if (this._getDeferred.isPending) {
        this._handshakeLogger.debug('Resolving the Deferred promise to fulfill all simultaneous requests');
        this._getDeferred.resolve(specification);
      }
      /** Unload the deferred promise */
      this._handshakeLogger.debug('Unloading the Deferred promise');
      this._getDeferred = undefined;
    }
  }


  /**
   * If a deferred promise exists, and is still waiting for the resolution reject it and unload
   * @private
   */
  private _rejectDeferredPromise(reason?: unknown) {
    /** Assert the deferred object exists */
    if (this._getDeferred) {
      /** Resolve if it is pending */
      if (this._getDeferred.isPending) {
        this._handshakeLogger.debug('Rejecting the Deferred promise to abort all simultaneous requests');
        /**
         * A reason is always carried through. Rejecting with nothing meant the caller that started the
         * retrieval got a real RequestError while everybody waiting on the same deferred got
         * 'undefined' — and 'catch (error) { error.message }' turned into a TypeError on those.
         */
        this._getDeferred.reject(reason ?? RequestError.fromError(new Error('Token retrieval aborted')));
      }
      /** Unload the deferred promise */
      this._handshakeLogger.debug('Unloading the Deferred promise');
      this._getDeferred = undefined;
    }
  }


  /**
   * Save the token into local storage and resolve the
   * pending deferred object with the loaded token
   * @param specification
   * @private
   */
  private async _consolidateToken(specification: TokenSpecification): Promise<TokenSpecification> {
    this._handshakeLogger.debug('Consolidating Token');

    /** Save the newly loaded token into internal storage */
    await this.transact(() => specification);

    /** Check the pending deferred request to resolve it */
    this._resolveDeferredPromise(specification);

    /** Return the consolidated token */
    return specification;
  }


  /**
   * Flush internal store token and reject the Deferred if it is pending
   * @param error
   * @private
   */
  private async _flushToken(error?: RequestError | null): Promise<RequestError> {
    this._handshakeLogger.debug('Flushing Token');

    /** If the current token must invalidate the entire client authentication, call parent function */
    if (this._configuration.getOrDefault('invalidateAuthOnGrantError', 'boolean', true)) {
      await this._client.flushAuth();
    }
    /** Else, clear only current token */
    else {
      await this.clear();
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

    /**
     * Everything below is wrapped so the Deferred can never be left pending.
     *
     * It is created above, before any of the work, and 'getSpecification' hands it to every caller that
     * arrives while a retrieval is in flight. So an exception escaping this method without settling it
     * did not merely fail one call: it left the Deferred pending and assigned forever, and every later
     * 'getSpecification' returned that same promise. The token silently stopped being obtainable —
     * every request needing it hung until the page was reloaded.
     *
     * Three routes used to escape this way: a throwing 'transformGrantResponse', a throwing
     * 'checkValidity', and a failure inside the sibling grant broadcast. The most likely one in
     * practice was none of those — it was reading 'this.value' during the startup window, before the
     * underlying storage finished loading, which threw 'Subject has not been initialized yet'.
     */
    try {
      return await this._retrieveValidTokenUnsafe();
    }
    catch (error) {
      this._rejectDeferredPromise(error);
      throw error;
    }
    finally {
      /**
       * Belt and braces. Every path through the chain settles the Deferred today — success through
       * '_consolidateToken', failure through the catch above — and this makes that an invariant rather
       * than a property of the current code: a future branch returning without consolidating a token
       * cannot leave a caller waiting forever. It is a no-op once the Deferred has been settled and
       * unloaded, which is the normal case.
       */
      this._rejectDeferredPromise(
        RequestError.fromError(new Error(`Token '${this._name}' retrieval ended without a token`))
      );
    }
  }


  /**
   * The actual retrieval chain, always invoked through {@link _retrieveValidToken} so that the Deferred
   * is settled whatever happens in here.
   * @private
   */
  private async _retrieveValidTokenUnsafe(): Promise<TokenSpecification> {
    /**
     * Wait for the underlying storage before reading the stored token.
     *
     * 'this.value' throws while the subject is uninitialized, and a client asks for its first token
     * during boot — exactly while the storage read is still in flight.
     */
    await this.isInitialized();


    // ----
    // Use token stored into local storage
    // ----
    const inMemoryToken = this.value;

    if (this.isValid(inMemoryToken)) {
      this._handshakeLogger.debug('In Memory Token is valid');

      /**
       * Nothing to consolidate: this token *is* what the storage already holds.
       *
       * It used to go through '_consolidateToken' regardless, which means 'transact' cloned the
       * specification and 'persist' hashed it against itself only to conclude that nothing had changed and
       * return. Every request carrying a token paid for that — measured at roughly 19µs per token, on the
       * main thread, to compare a value with itself. The Deferred still has to be settled, because callers
       * that arrived while this was running are waiting on it.
       */
      this._resolveDeferredPromise(inMemoryToken);

      return inMemoryToken;
    }


    // ----
    // Get all Tokens defined Extractors
    // ----
    const tokenExtractors = this._getTokenExtractors();


    // ----
    // Extract the token from QueryParam of current Window Location URL
    // ----
    const queryParamExtractor = tokenExtractors
      .find((extractor) => extractor.type === 'query-param') as TokenQueryParamExtractor | undefined;

    if (queryParamExtractor && isBrowser) {
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
        const consolidatedToken = await this._consolidateToken(specification);

        /**
         * Remove the query params string and replace the search params.
         * This behavior occurs only if the token must be kept 'private',
         * this will not completely hide the token, but will be removed from
         * query parameters
         */
        if (queryParamExtractor.hideWhenExtracted) {
          /** Remove the token from the UrlSearchParams collection */
          urlSearchParams.delete(queryParamExtractor.extract.token);
          /** Replace the history, removing search param without reloading the browser */
          window.history.replaceState(
            null,
            '',
            [ window.location.pathname, urlSearchParams.toString() ].filter(Boolean).join('?')
          );
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
      this._handshakeLogger.debug('Using the grant request to retrieve the token');

      /** Compile the grant request before send to the client to remove the current token from the request */
      const compiledRequest = this._client.compileRequest<TokenSpecification>(grantRequest);

      /** Remove the current token from the useToken object */
      if (isObject(compiledRequest.useTokens)) {
        compiledRequest.useTokens[this._name] = false;
      }

      /** Make the Request */
      const [ grantTokenError, rawTokenResponse ] = await this._client.safeRequest<TokenSpecification>(compiledRequest);

      /** Immediately stop if a grant token error occurred */
      if (grantTokenError) {
        throw await this._flushToken(grantTokenError);
      }

      /** Extract the post-response grant transform function */
      const transformGrantResponse = this._configuration.get(
        'transformGrantResponse',
        (config) => typeof config === 'function'
      );

      const tokenResponse = typeof transformGrantResponse === 'function'
        ? transformGrantResponse(rawTokenResponse, this._client)
        : rawTokenResponse;

      /** Throw if an invalid request has been made */
      if (!this.isValid(tokenResponse)) {
        throw await this._flushToken(grantTokenError);
      }

      /** Assert token response is valid */
      if (this.isValid(tokenResponse)) {
        /** Broadcast rawTokenResponse to other Token Handshakes */
        await this._client.onTokenGrantResponseReceived(this._name, rawTokenResponse);

        return this._consolidateToken(tokenResponse);
      }
    }


    // ----
    // Reject as no able to load token
    // ----
    throw await this._flushToken();
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
  public async clear() {
    /** Remove the internal stored token specification, only if is not manually controlled */
    if (!this._configuration.getOrDefault('isManuallyControlled', 'boolean', false)) {
      await this.transact(() => TokenHandshake._defaultTokenSpecification);
    }

    /** Check the pending deferred request to reject it */
    this._rejectDeferredPromise();
  }


  /**
   * Release this handshake, rejecting any token retrieval still in flight.
   *
   * The pending Deferred is settled before the storage goes: a caller blocked on `getSpecification`
   * deserves an error, not a promise that will never move again.
   */
  public dispose(): void {
    if (this.isDisposed) {
      return;
    }

    this._rejectDeferredPromise(
      RequestError.fromError(new Error(`TokenHandshake '${this._name}' was disposed`))
    );

    super.dispose();
  }


  /**
   * React to a token of this handshake having been rejected by the server, and say whether the request that
   * carried it is worth retrying.
   *
   * The comparison is the compare-and-swap behind the client's retry on a 401. Several requests can be in
   * flight carrying the same token and all of them can come back rejected, so three situations have to be
   * told apart — and collapsing them wrongly is how a retry either storms the grant endpoint or gives up
   * on requests it could have saved:
   *
   * - **the stored token is the rejected one** — drop it, and retry. This is the first rejection to arrive
   * - **the stored token is something else already** — a sibling rejection got here first and either
   *   refreshed it or is refreshing it right now. Nothing to drop, and retrying is exactly right: the
   *   attempt will wait on that same refresh and send whatever comes out of it
   * - **the token is manually controlled** — the application owns its lifecycle, so it is neither dropped
   *   nor retried. This flag is the opt-out for the whole behaviour
   *
   * @param token The token string the caller sent, and got rejected
   * @returns Whether a retry is worth attempting
   */
  public async invalidateRejectedToken(token: string): Promise<boolean> {
    if (this._configuration.getOrDefault('isManuallyControlled', 'boolean', false)) {
      this._handshakeLogger.debug('Token is manually controlled, refusing to invalidate it');
      return false;
    }

    /** Somebody else already replaced it: a retry will pick up whatever they produced */
    if (!this._isSubjectInitialized || this.value.token !== token) {
      this._handshakeLogger.debug('Stored token is not the rejected one any more, a retry will use the current one');
      return true;
    }

    this._handshakeLogger.info('Invalidating the rejected token');
    await this.clear();

    return true;
  }


  /**
   * Check the validity of a token specification object
   * @param specification
   */
  public isValid(specification?: unknown): specification is TokenSpecification {
    /** Get the user-defined check validity function */
    const checkValidity = this._configuration.get('checkValidity', 'function');

    /** If a custom function exists, use it to validate token */
    if (checkValidity) {
      this._handshakeLogger.debug('Using the custom function to check token validity');
      return checkValidity(specification, this._client);
    }

    /** Assert the token is a valid object */
    if (typeof specification !== 'object' || specification === null) {
      this._handshakeLogger.debug('Token seems not to be a valid object');
      return false;
    }

    /** Wrap candidate in a typed object */
    const candidate = specification as Partial<TokenSpecification>;

    /** Assert the token is a valid string */
    if (!isValidString(candidate.token)) {
      this._handshakeLogger.debug('Token string field seems not to be a valid string');
      return false;
    }

    /** If the token haven't got expire date, then would be considered not expiring */
    if (candidate.expiresAt == null) {
      return true;
    }

    /** Transform the expiresAt using Date constructor */
    const expireDate = new Date(candidate.expiresAt);

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
  public async setExplicit(specification: TokenSpecification): Promise<TokenSpecification> {
    return this._consolidateToken(specification);
  }


  /**
   * Get a valid usable token using all methods
   * provided withing configuration
   */
  public async getSpecification(): Promise<TokenSpecification> {
    /**
     * A token that is already valid needs no coordination whatsoever.
     *
     * This check sits above the Deferred on purpose. Reaching the retrieval below allocates a Deferred —
     * and with it a Promise and the catch handler attached to it — then walks an async function with a
     * try/finally, all to hand back a value that was sitting right here. Since every concurrent caller
     * runs this same check, there is nothing to collapse and nothing to settle: skipping the machinery
     * changes no behaviour, it just stops paying for it on the overwhelmingly common path.
     *
     * ⚠️ Gated on the storage being initialized, and that guard is not optional. Reading 'value' before the
     * first storage read completes throws, and a client asks for its first token *during* boot — which is
     * exactly when that read is still in flight. The retrieval below awaits initialization for this very
     * reason; a fast path that skipped the await broke every request issued at startup against a storage
     * slower than a synchronous one, which is to say against React Native's.
     */
    if (this._isSubjectInitialized) {
      const inMemoryToken = this.value;

      if (this.isValid(inMemoryToken)) {
        return inMemoryToken;
      }
    }

    this._handshakeLogger.info('Loading Token');

    /** Check if a deferred promise already exists, return the pending request */
    if (this._getDeferred?.isPending) {
      this._handshakeLogger.info('A deferred request for the Token already exists. Wait for it');
      return this._getDeferred.promise;
    }

    /** Start a retrieval, and register the Deferred every caller of this method waits on */
    this._initializeDeferredPromise();
    const deferred = this._getDeferred!;

    /**
     * Every caller waits on the Deferred, the one that started the retrieval included.
     *
     * It used to hand the retrieval promise straight back to the first caller and the Deferred to
     * everybody after it, which meant the first caller was not covered by the Deferred at all: settling
     * it — from `clear`, from `dispose`, from a failure elsewhere — moved every waiter except the one
     * that had actually asked. One settlement point removes that asymmetry, and it is what lets
     * `dispose()` unblock a caller instead of leaving it holding a promise nothing will ever settle.
     *
     * The retrieval's own rejection is swallowed here because the Deferred already carries it; awaiting
     * it as well would only produce a duplicate unhandled rejection.
     */
    this._retrieveValidToken().catch(() => undefined);

    return deferred.promise;
  }


  /**
   * Append the Token to a Client Request
   * @param request
   * @param transporterType
   */
  public async appendToken(
    request: TransportRequestConfig,
    transporterType: UseTokenTransporter
  ): Promise<TokenSpecification | undefined> {
    /** Get the Transporter */
    const transporter = this._getTransporterConfiguration(transporterType);

    /** Assert Transporter exists */
    if (!transporter) {
      /** Show error only if a transporter was requested */
      if (transporterType !== false) {
        throw new Error(
          `Requested transporter '${(transporterType === true ? 'DefaultTransporter' : transporterType)}' was not found`
        );
      }

      return;
    }

    this._handshakeLogger.debug(`Using transporter '${transporter.type}' to append Token to Request`);

    /** Get the Token */
    const [ tokenError, specification ] = await will(this.getSpecification());

    if (tokenError) {
      throw tokenError;
    }

    if (!specification) {
      throw new Error('Token has been get without errors, but no token exists');
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
        throw new Error(`Invalid Transporter Type Found : ${(transporter as any).type}`);
    }

    /**
     * Hand the attached token back to the caller.
     *
     * The client keeps it so that, if the server answers 401, it can invalidate *that* token rather than
     * whatever the handshake happens to hold by then — see 'invalidateIfCurrent'.
     */
    return specification;
  }


  /**
   * Extract usable token from AuthResponse
   * @param authResponse
   * @param authAction
   */
  public async extractTokenFromAuthResponse(authResponse: any, authAction: AuthActionType) {
    /** Get all auth response extractor */
    const extractors = this._getTokenExtractors()
      .filter(e => e.type === 'auth-response') as TokenAuthResponseExtractor<any>[];

    /** If any extractors exist, use to get the token from response */
    const extractorsPromises = extractors.map(async (extractor) => {
      /** Get the extractor configuration */
      const extract = typeof extractor.extract === 'function' ? extractor.extract : extractor.extract[authAction];

      /** Assert the extractor exists before use it */
      if (typeof extract !== 'function') {
        return;
      }

      /** Get the token specification from response */
      const tokenSpecification = extract(authResponse, authAction, this._client);

      if (this.isValid(tokenSpecification)) {
        await this._consolidateToken(tokenSpecification);
      }
    });

    /** Await resolution of all promises */
    await Promise.all(extractorsPromises);
  }


  /**
   * Extracts a token from a sibling grant response using the defined extractors.
   *
   * @param {Tokens} tokenName - The name of the token to be extracted.
   * @param {any} response - The sibling grant response object used to extract the token.
   */
  public async extractTokenFromSiblingGrant(tokenName: Tokens, response: any) {
    /** Get all grant response extract */
    const extractors = this._getTokenExtractors()
      .filter(e => (
        e.type === 'grant-response' && Array.isArray(e.fromGrantOf) && e.fromGrantOf.includes(tokenName)
      )) as TokenGrantResponseExtractor<any, any>[];

    /** If any extractors exist, use to get the token from response */
    const extractorsPromises = extractors.map(async (extractor) => {
      /** Assert the extractor exists before use it */
      if (typeof extractor.extract !== 'function') {
        return;
      }

      /** Get the token specification from the response */
      const tokenSpecification = extractor.extract(response, tokenName, this._client);

      if (this.isValid(tokenSpecification)) {
        await this._consolidateToken(tokenSpecification);
      }
    });

    /** Await resolution of all promises */
    await Promise.all(extractorsPromises);
  }

}
