import { TemporaryStorage } from '@proedis/client';
import type { StorageProvider } from '@proedis/client';

import NativeAsyncStorage from './NativeAsyncStorage';


/* --------
 * Storage Providers Export
 * -------- */
export const ReactNativeStorageProvider: () => StorageProvider = () => ({
  local  : new NativeAsyncStorage(),
  page   : new TemporaryStorage(),
  session: new TemporaryStorage()
});


/* --------
 * Internal Class Export
 * -------- */
export { NativeAsyncStorage };
