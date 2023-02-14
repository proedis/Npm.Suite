import type { Serializable } from '@proedis/types';

import type { EventsDescription } from '../Emitter/Emitter.types';


// ----
// Storage persistent type
// ----
export type StoragePersistency = 'local' | 'session' | 'page';


// ----
// Storage Events
// ----
export type OnStorageValueChangeHandler<Storage extends Serializable, Key extends keyof Storage> =
  (name: Key, value: Storage[Key], oldValue: Storage[Key]) => void;

export interface StorageEvents<Storage extends Serializable> extends EventsDescription {
  /** Called every times a property value is changing */
  onValueChange: OnStorageValueChangeHandler<Storage, keyof Storage>;
}
