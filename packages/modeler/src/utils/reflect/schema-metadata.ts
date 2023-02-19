import type { AnyObject, Instantiable } from '@proedis/types';

import { Guard } from '@proedis/utils';

import { DecoratorKeys } from '../../constants';

import InvalidSchema from '../../errors/InvalidSchema';
import InvalidSchemaName from '../../errors/InvalidSchemaName';
import MultipleDecoratedSchema from '../../errors/MultipleDecoratedSchema';

import type { ISchemaOptions, ISchemaMetadata } from '../../interfaces/schemas';


/**
 * Extract from a schema the reflected metadata properties
 * @param schema
 */
export function getSchemaMetadata<T extends AnyObject>(schema: Instantiable<T>): ISchemaMetadata<T> {
  return Guard.andThrow(InvalidSchema, schema)
    .ifNil(Reflect.getOwnMetadata(DecoratorKeys.SchemaMetadata, schema));
}


/**
 * Extract and return the metadata defined on the Schema object
 * from a document instance
 * @param instance
 */
export function getConstructorMetadata<T extends AnyObject>(instance: T): ISchemaMetadata<T> {
  return Guard.andThrow(InvalidSchema, instance)
    .ifNil(Reflect.getOwnMetadata(DecoratorKeys.SchemaMetadata, instance.constructor));
}


/**
 * Store all the metadata related to a specific schema
 * into the instantiable schema constructor element.
 * This function will fail if the name of the schema
 * could not be found, or if the schema
 * has the metadata properties defined
 * @param schema
 * @param options
 */
export function storeSchemaMetadata<T extends AnyObject>(schema: Instantiable<T>, options: ISchemaOptions<T>) {
  /** Assert a valid schema name has been defined, or fallback to generic Unnamed */
  Guard.andThrow(InvalidSchemaName, schema).ifNil(options?.name || schema.name);

  /** Check if the schema already contains a Schema Definition */
  Guard.andThrow(MultipleDecoratedSchema, schema)
    .ifNotNil(Reflect.getOwnMetadata(DecoratorKeys.SchemaMetadata, schema));

  /** Define the schema metadata to the schema object */
  const metadata: ISchemaMetadata<T> = { isSchema: true, ...options };

  /** Reflect metadata */
  Reflect.defineMetadata(DecoratorKeys.SchemaMetadata, metadata, schema);
}
