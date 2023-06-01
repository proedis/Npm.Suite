import type { StorageApi } from '../../lib/Storage/Storage.types';


/**
 * The TemporaryStorage will use a base Map<string, any> storage
 * under the hood to provide base non-persistent storage to any platform
 */
export default class TemporaryStorage implements StorageApi {

  public name: string = 'NotPersistentStorage';


  private readonly _store = new Map<string, any>();


  public get<T>(key: string, alternative?: any): Promise<T> {
    return Promise.resolve(this._store.get(key) ?? alternative);
  }


  public set(key: string, data: any, overwrite?: boolean): Promise<void> {
    const currentValue = this._store.get(key);

    if (currentValue != null && !overwrite) {
      return Promise.resolve(undefined);
    }

    this._store.set(key, data);

    return Promise.resolve(undefined);
  }

}
