import type { AnyObject, Instantiable } from '@proedis/types';

import { Guard } from '@proedis/utils';

import { DecoratorKeys } from '../../constants';

import InvalidPropMetadata from '../../errors/InvalidPropMetadata';

import type { IPropMetadata } from '../../interfaces/props';


/* --------
 * Internal Utilities
 * -------- */

/**
 * Return the PropsStorage created for the schema constructor.
 * If the storage doesn't exist, a new one will be created
 * @param schema
 */
function getPropsStorage<T extends AnyObject>(schema: Instantiable<T>): Map<string, IPropMetadata<T, any>> {
  /** Get the existing props storage from schema */
  const storage = Reflect.getOwnMetadata(DecoratorKeys.PropsStorage, schema);

  /** Create a new storage if it doesn't exist */
  if (!storage) {
    Reflect.defineMetadata(DecoratorKeys.PropsStorage, new Map(), schema);
  }

  /** Return found storage or the new one */
  return storage ?? getPropsStorage(schema);
}


/* --------
 * External Utilities
 * -------- */

/**
 * Returns prop metadata for requested property name for a registered schema
 * @param schema
 * @param property
 */
export function getPropMetadata<T extends AnyObject>(
  schema: Instantiable<T>,
  property: string
): IPropMetadata<T, any> {
  return Guard.andThrow(InvalidPropMetadata, property).ifNil(getPropsStorage(schema).get(property));
}


/**
 * Save prop metadata for requested property name for a registered schema
 * @param schema
 * @param property
 * @param metadata
 */
export function setPropMetadata<T extends AnyObject, TOut, TIn>(
  schema: Instantiable<T>,
  property: string,
  metadata: IPropMetadata<T, TOut, TIn>
): IPropMetadata<T, TOut, TIn> {
  getPropsStorage(schema).set(property, metadata);
  return metadata;
}
