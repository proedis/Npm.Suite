import type { StoreBase } from 'store2';

import type { StorageApi } from '../../lib/Storage/Storage.types';


/**
 * The Store2Storage will use a StoreBase API object
 * from 'store2' package under the hood to provide
 * store functionality on Browser
 */
export default class Store2SStorage implements StorageApi {


  public name: string = 'PersistencyDependantStorage';


  constructor(private readonly _store: StoreBase) {
  }


  public get<T>(key: any): Promise<T | null>;
  public get<T>(key: any, alternative?: any): Promise<T> {
    const result = this._store.get(key, alternative);
    return Promise.resolve(result as T);
  }


  public set(key: any, data: any, overwrite?: boolean): Promise<void> {
    this._store.set(key, data, overwrite);
    return Promise.resolve(undefined);
  }

}
