import type { AnyObject } from '@proedis/types';


/**
 * The schema metadata object is an object that will be stored
 * into the storage of the object and has all the
 * key and the options relative to the schema
 */
export interface ISchemaMetadata<T extends AnyObject> extends ISchemaOptions<T> {
  /** Internally defined boolean that indicate the schema is valid */
  isSchema: true;
}


export interface ISchemaOptions<T extends AnyObject> {
  /** The name of the registered schema */
  name: string;
}
