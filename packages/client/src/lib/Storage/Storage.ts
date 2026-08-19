import { Deferred, hasEqualHash, deepClone, will } from '@proedis/utils';
import type { AnyObject } from '@proedis/types';

import ClientSubject from '../ClientSubject/ClientSubject';
import Logger from '../Logger/Logger';

import type { StorageApi, StorageProvider, StoragePersistency } from './Storage.types';


/* --------
 * Storage Definition
 * -------- */
export default class Storage<Data extends AnyObject> extends ClientSubject<Data> {

  // ----
  // Constants
  // ----
  public static AppName: string = 'Unnamed';


  // ----
  // Private instance fields
  // ----
  private _initDeferred: Deferred<Data> | undefined;

  private readonly _storageLogger: Logger;

  private readonly _store: StorageApi;


  private get _key(): string {
    return `${Storage.AppName}::AppClient::Storage::${this._namespace}`;
  }


  // ----
  // Storage constructor
  // ----
  constructor(
    private readonly _namespace: string,
    persistency: StoragePersistency,
    initialData: Data,
    storage: StorageProvider
  ) {
    /** Init the parent emitter */
    super(`Storage::${_namespace}`);

    /** Create the logger */
    this._storageLogger = Logger.forContext(`Storage::${this._namespace}`);

    /** Create the store content using requested persistency */
    this._store = storage[persistency];

    /** Initialize the Deferred object */
    this._initDeferred = new Deferred<Data>();

    /**
     * Create the initial function to resolve the deferred object and complete the process.
     *
     * The subject is initialized **before** the deferred resolves, and the order matters: anything
     * awaiting initialization goes on to read 'this.value', which throws while the subject is missing.
     * The reverse order happened to work only because an awaiting continuation runs in a later
     * microtask — correct by scheduling accident rather than by construction.
     */
    const initAndResolve = (data: Data): Data => {
      /** A storage disposed while its first read was still in flight must not build a subject now */
      if (this.isDisposed) {
        this._storageLogger.debug('Storage was disposed before initialization completed, discarding data');
        return data;
      }

      /** Complete the initialization process of the Subject */
      this._initializeSubject(data);

      /** Resolve the initDeferred object */
      if (this._initDeferred) {
        this._initDeferred.resolve(data);
        this._initDeferred = undefined;
      }

      return data;
    };

    /** Await the get of stored data and complete initialization */
    this._store.get<Data>(this._key, initialData)
      .then((data) => {
        initAndResolve(data);
      })
      .catch((error) => {
        this._storageLogger.error('An error occurred while initializing the Storage, restore to initial data', error);
        initAndResolve(initialData);
      });
  }


  /**
   * Save the current store into local storage, and emit new data
   * using the internal BehaviourSubject object.
   * NewData and OldData will be compared using hash:
   * if no changes have been made, no data will be emitted
   * @private
   */
  private async persist(newData: Data): Promise<void> {
    /** If the initDeferred object is still in progress, await resolution */
    if (this._initDeferred) {
      await this._initDeferred.promise;
    }

    /** Save the storage, and emit next data only if it has some changes */
    if (hasEqualHash(this.value, newData)) {
      this._storageLogger.debug('Old data and new data has same values, omit saving');
      return;
    }

    /** Save the current data into LocalStorage */
    this._storageLogger.debug(`Saving storage '${this._namespace}'`, newData);
    const [ setError ] = await will(this._store.set(this._key, newData, true));

    if (setError) {
      this._storageLogger.error('An error occurred while saving data into Storage', setError);
    }
    else {
      this._next(newData);
    }
  }


  // ----
  // Public Methods
  // ----

  public async isInitialized(): Promise<Data> {
    /** If the deferred initialization object exists, return that */
    if (this._initDeferred) {
      return this._initDeferred.promise;
    }

    /** Return a default promise resolved with data */
    return Promise.resolve(this.value);
  }


  /**
   * Return the value of a property
   * @param key
   */
  public get<Key extends keyof Data>(key: Key): Data[Key] {
    return this.value[key];
  }


  /**
   * Set the value of a property
   * @param key
   * @param value
   */
  public async set<Key extends keyof Data>(key: Key, value: (Data[Key] | ((current: Data[Key]) => Data[Key]))) {
    /**
     * Await initialization before touching 'this.value'.
     *
     * Without it, calling 'set' inside the startup window threw 'Subject has not been initialized
     * yet': the current value is read synchronously, before 'persist' gets a chance to await anything.
     * 'transact' always awaited, so the two methods disagreed on whether they were safe to call early.
     */
    await this.isInitialized();

    await this.persist({
      ...this.value,
      [key]: typeof value === 'function'
        ? (value as ((current: Data[Key]) => Data[Key]))(this.value[key])
        : value
    });
  }


  /**
   * Release this storage, completing its subject and unblocking anything waiting on initialization.
   *
   * A pending initialization is rejected rather than abandoned: `isInitialized` is awaited by every write
   * path, so leaving it pending would hang each of them forever instead of failing them.
   */
  public dispose(): void {
    if (this.isDisposed) {
      return;
    }

    const pendingInitialization = this._initDeferred;
    this._initDeferred = undefined;

    super.dispose();

    if (pendingInitialization?.isPending) {
      /** Attached first, so rejecting a promise nobody awaited does not surface as an unhandled one */
      pendingInitialization.promise.catch(() => {
        this._storageLogger.debug('Initialization abandoned because the Storage was disposed');
      });

      pendingInitialization.reject(new Error(`Storage '${this._namespace}' was disposed before initializing`));
    }
  }


  /**
   * Apply several updates to the stored data in a single persist operation.
   *
   * The callback receives a deep clone, not the live value: mutating it in place is both allowed and
   * the point, since the emitted value is frozen and could not be mutated anyway.
   *
   * @param updateFn Receives a mutable copy of the current data and returns the data to persist
   */
  public async transact(updateFn: ((data: Data) => Data)) {
    /** Await the module is initialized */
    await this.isInitialized();

    /** Clone current data */
    const deepDataCopy = deepClone<Data>(this.value);

    /** Save the new data after transaction */
    await this.persist(updateFn(deepDataCopy));
  }


}
