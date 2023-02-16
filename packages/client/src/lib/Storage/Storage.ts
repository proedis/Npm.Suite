import store from 'store2';
import type { StoreBase } from 'store2';

import merge from 'ts-deepmerge';

import { hasEqualHash } from '@proedis/utils';
import type { Serializable } from '@proedis/types';

import ClientSubject from '../ClientSubject/ClientSubject';
import Logger from '../Logger/Logger';


/* --------
 * Internal Types
 * -------- */
export type StoragePersistency = 'local' | 'session' | 'page';


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
  private readonly _storageLogger: Logger;

  private readonly _store: StoreBase;


  private get _key(): string {
    return `${Storage.AppName}::AppClient::Storage::${this._namespace}`;
  }


  // ----
  // Storage constructor
  // ----
  constructor(private readonly _namespace: string, persistency: StoragePersistency, initialData: Data) {
    /** Init the parent emitter */
    super(`Storage::${_namespace}`);

    /** Create the logger */
    this._storageLogger = Logger.forContext(`Storage::${this._namespace}`);

    /** Create the store content using requested persistency */
    this._store = store[persistency];

    /** Create the Subject, _data is a Proxy, must deconstruct it */
    this._initializeSubject(this._store.get(this._key, initialData) as Data);
  }


  /**
   * Save the current store into local storage, and emit new data
   * using the internal BehaviourSubject object.
   * NewData and OldData will be compared using hash if: no changes have been made,
   * no data will be emitted
   * @private
   */
  private persist(newData: Data): void {
    /** Save the storage, and emit next data only if it has change */
    if (hasEqualHash(this.value, newData)) {
      this._storageLogger.debug('Old data and new data has same values, omit saving');
      return;
    }

    /** Save the current data into LocalStorage */
    this._storageLogger.debug(`Saving storage '${this._namespace}'`, newData);
    this._store.set(this._key, newData, true);
    this._next(newData);
  }


  // ----
  // Public Methods
  // ----

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
  public set<Key extends keyof Data>(key: Key, value: Data[Key]) {
    this.persist({
      ...this.value,
      [key]: value
    });
  }


  /**
   * Perform multiple update to data object
   * @param updateFn
   */
  public transact(updateFn: ((data: Data) => Data)) {
    /** Clone current data */
    const deepDataCopy = merge({}, this.value) as Data;

    /** Save the new data after transaction */
    this.persist(updateFn(deepDataCopy));
  }


}
