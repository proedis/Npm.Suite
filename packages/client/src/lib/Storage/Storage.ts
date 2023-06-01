import { Deferred, hasEqualHash, mergeObjects, will } from '@proedis/utils';
import type { Serializable } from '@proedis/types';

import ClientSubject from '../ClientSubject/ClientSubject';
import Logger from '../Logger/Logger';

import type { StorageApi, StorageProvider, StoragePersistency } from './Storage.types';


/* --------
 * Storage Definition
 * -------- */
export default class Storage<Data extends Serializable> extends ClientSubject<Data> {

  // ----
  // Constants
  // ----
  public static AppName: string = 'Unnamed';


  // ----
  // Private instance fields
  // ----
  private _initDeferred: Deferred<void> | undefined;

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
    this._initDeferred = new Deferred<void>();

    /** Create the initial function to resolve the deferred object and complete the process */
    const initAndResolve = (data: Data): Data => {
      this._initDeferred?.resolve(data);
      this._initDeferred = undefined;
      this._initializeSubject(data);
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

  public async isInitialized(): Promise<void> {
    /** If the deferred initialization object exists, return that */
    if (this._initDeferred) {
      return this._initDeferred.promise;
    }
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
  public async set<Key extends keyof Data>(key: Key, value: Data[Key]) {
    await this.persist({
      ...this.value,
      [key]: value
    });
  }


  /**
   * Perform multiple update to data object
   * @param updateFn
   */
  public async transact(updateFn: ((data: Data) => Data)) {
    /** Clone current data */
    const deepDataCopy = mergeObjects<Data>({}, this.value);

    /** Save the new data after transaction */
    await this.persist(updateFn(deepDataCopy));
  }


}
