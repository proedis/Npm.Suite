import store from 'store2';

import type { StorageProvider } from '../../lib/Storage/Storage.types';

import Store2SStorage from './Store2SStorage';
import TemporaryStorage from './TemporaryStorage';


/* --------
 * Storage Providers Export
 * -------- */
export const BrowserStorageProvider: () => StorageProvider = () => ({
  local  : new Store2SStorage(store.local),
  page   : new Store2SStorage(store.page),
  session: new Store2SStorage(store.session)
});


/* --------
 * Internal Class Export
 * -------- */
export { Store2SStorage, TemporaryStorage };
