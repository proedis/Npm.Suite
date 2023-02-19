import type { AnyObject, Instantiable } from '@proedis/types';

import { Guard } from '@proedis/utils';

import { DecoratorKeys } from '../../constants';

import IdentityNotDefined from '../../errors/IdentityNotDefined';

import { getPropertyConstructor } from './property-constructor';

import type { IPropMetadata, TIdentityType } from '../../interfaces/props';
import WrongIdentityType from '../../errors/WrongIdentityType';


/**
 * Extract and return the identity metadata from a schema
 * @param schema
 */
export function getIdentityMetadata<T extends AnyObject>(schema: Instantiable<T>): IPropMetadata<T, any> {
  return Guard.andThrow(IdentityNotDefined, schema)
    .ifNil(Reflect.getOwnMetadata(DecoratorKeys.IdentityMetadata, schema));
}


/**
 * Extract and return the metadata defined on the Schema Object
 * related to the identified primary key
 * @param instance
 */
export function getConstructorIdentityMetadata<T extends AnyObject>(instance: T): IPropMetadata<T, any> {
  return Guard.andThrow(IdentityNotDefined, instance)
    .ifNil(Reflect.getOwnMetadata(DecoratorKeys.IdentityMetadata, instance.constructor));
}


/**
 * Store the identity metadata of the provided schema into the schema itself,
 * to be accessible using schema or the instance constructor
 * @param schema
 * @param property
 * @param descriptor
 */
export function storeIdentityMetadata<T extends AnyObject>(
  schema: Instantiable<T>,
  property: string,
  descriptor: TypedPropertyDescriptor<TIdentityType>
) {
  /** Get the constructor of the property */
  const ctor = getPropertyConstructor(schema, property);

  /** Define the identity metadata */
  const metadata: IPropMetadata<T, TIdentityType> = {
    descriptor,
    isIdentity: true,
    name      : property,
    type      : Guard.andThrow(WrongIdentityType, property).ifNotIn(ctor, [ String, Number ])
  };

  /** Save metadata into schema */
  Reflect.defineMetadata(DecoratorKeys.IdentityMetadata, metadata, schema);
}
