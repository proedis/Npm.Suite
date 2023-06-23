import AsyncStorageModule from '@react-native-async-storage/async-storage';

import { isValidString } from '@proedis/utils';

import type { StorageApi } from '@proedis/client';


/**
 * The NativeAsyncStore will use the official community package
 * React Native Async Store under the hood to provide store functionality
 * on React Native Expo App
 */
export default class NativeAsyncStorage implements StorageApi {


  public name: string = 'ReactNativeStorage';


  public asyncStorage: typeof AsyncStorageModule = (() => {
    /**
     * In some system, the AsyncStorage module will be imported using 'default', try to assert the create function exists
     * Take this code as an experimental work-around
     */
    return typeof (AsyncStorageModule as { default?: typeof AsyncStorageModule }).default?.getItem === 'function'
      ? (AsyncStorageModule as unknown as { default: typeof AsyncStorageModule }).default
      : AsyncStorageModule;
  })();


  private getKey(key: string): string {
    return key.charAt(0) === '@' ? key : `@${key}`;
  }


  public async get<T>(key: string, alternative?: any): Promise<T> {
    /** Load data from AsyncStorage */
    const data = await this.asyncStorage.getItem(this.getKey(key));

    /** If retrieved data is not a valid string, return alternative */
    if (!isValidString(data)) {
      return alternative;
    }

    /** If data has been found, deserialize using JSON */
    try {
      return JSON.parse(data);
    }
    catch {
      return alternative;
    }
  }


  public async set(key: string, data: any, overwrite?: boolean): Promise<void> {
    const storageKey = this.getKey(key);

    /** Get the value from the AsyncStorage */
    const currentValue = await this.get(storageKey);

    /** If the current value exists, and must not be overridden, return */
    if (currentValue != null && !overwrite) {
      return;
    }

    /** If no data exists, clear the value */
    if (data == null) {
      await this.asyncStorage.removeItem(storageKey);
      return;
    }

    /** Store the new value */
    await this.asyncStorage.setItem(storageKey, JSON.stringify(data));
  }

}
