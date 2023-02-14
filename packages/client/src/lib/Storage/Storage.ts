import store from 'store2';
import type { StoreBase } from 'store2';

import type { Serializable } from '@proedis/types';

import Logger from '../Logger/Logger';
import Emitter from '../Emitter/Emitter';

import type { StorageEvents, StoragePersistency } from './Storage.types';


export default class Storage<Data extends Serializable> extends Emitter<StorageEvents<Data>> {

  // ----
  // Constants
  // ----
  private static readonly _onValueChangeEventName: keyof StorageEvents<any> = 'onValueChange';

  public static AppName: string = 'Unnamed';


  // ----
  // Private instance fields
  // ----
  private readonly _logger: Logger;

  private readonly _store: StoreBase;

  private _data: Data;


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
    this._logger = Logger.forContext(`Storage::${this._namespace}`);

    /** Create the store content using requested persistency */
    this._store = store[persistency];

    /** Create the data proxy to handle property change */
    this._data = this._initializeDataProxy(this._store.get(this._key, initialData) as Data);
  }


  // ----
  // Internal Methods
  // ----

  /**
   * Return a new Proxy for Data Object
   * @param data
   * @private
   */
  private _initializeDataProxy(data: Data): Data {
    /** Initialize the Storage Object */
    const self = this;
    return new Proxy<Data>(data, {
      /** Override the default setter to handle watch for property change */
      set(target: Data, p: string | symbol, value: any): boolean {
        /** Log the action */
        self._logger.debug(`Changing '${String(p)}' value for storage ${self._namespace}`);
        /** Save the current target property value */
        const currentValue = target[p as keyof Data];
        /** If property is not changing, abort */
        if (currentValue === value) {
          self._logger.debug(`No change were made to '${String(p)}' value because old and new value are the same`);
          return true;
        }
        /** Set the property on storage */
        target[p as keyof Data] = value;
        /** Emit the change event */
        self.dispatch(Storage._onValueChangeEventName, [ p as keyof Data, value, currentValue ]);
        /** Save the storage */
        self.persist();
        /** Return boolean indicating property has been set */
        return true;
      }
    });
  }


  /**
   * Save the current store into local storage
   * @private
   */
  private persist(): void {
    /** Save the current data into LocalStorage */
    this._logger.debug(`Saving storage '${this._namespace}'`, this._data);
    this._store.set(this._key, this._data, true);
  }


  // ----
  // Public Fields
  // ----
  public get data(): Data {
    return this._data;
  }


  // ----
  // Public Methods
  // ----

  /**
   * Return the value of a property
   * @param key
   */
  public get<Key extends keyof Data>(key: Key): Data[Key] {
    return this._data[key];
  }


  /**
   * Set the value of a property
   * @param key
   * @param value
   */
  public set<Key extends keyof Data>(key: Key, value: Data[Key]) {
    return this._data[key] = value;
  }


  /**
   * Perform multiple update to data object
   * @param updateFn
   */
  public transact(updateFn: ((data: Data) => Data)) {
    /** Clone current data */
    const clonedStoredData = { ...this._data };
    /** Build the new data to store */
    const newData = updateFn(clonedStoredData);

    /** Dispatch the property change */
    Object.keys(newData).forEach((newDataKey) => {
      /** Get the new value */
      const newValue = newData[newDataKey as keyof Data];
      /** Get the old value */
      const oldValue = clonedStoredData[newDataKey as keyof Data];
      /** Check value is changed before dispatch */
      if (newValue !== oldValue) {
        this.dispatch(Storage._onValueChangeEventName, [ newDataKey as keyof Data, newValue, oldValue ]);
      }
    });

    /** Replace the stored object */
    this._data = this._initializeDataProxy(newData);

    /** Save the new data after transaction */
    this.persist();
  }


}
