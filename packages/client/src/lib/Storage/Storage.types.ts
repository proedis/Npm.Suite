/* --------
 * The Storage Module
 * -------- */
export type StorageProvider = Record<StoragePersistency, StorageApi>;


/* --------
 * All possible type of storage
 * -------- */
export type StoragePersistency = 'local' | 'session' | 'page';


/* --------
 * Minimal API that Storage must expose to save/retrieve data
 * -------- */
export interface StorageApi {

  name: string;

  get<T>(key: string): Promise<T | null>;

  get<T>(key: string, alternative?: any): Promise<T>;

  set(key: string, data: any, overwrite?: boolean): Promise<void>;

}
