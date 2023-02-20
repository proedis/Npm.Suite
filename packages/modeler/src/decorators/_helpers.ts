import type { AnyObject, Instantiable } from '@proedis/types';

import { getPropertyConstructor, getPropMetadata, storePropMetadata } from '../utils';

import type { IPropMetadata, IPropOptions, TPropDecorator } from '../interfaces/props';


/* --------
 * Internal Utilities
 * -------- */

/**
 * Return stored prop metadata, or if not found, created new defaults
 * that could be extended and modified.
 * @param schema
 * @param property
 * @param descriptor
 */
function getPropsMetadataOrDefault<T extends AnyObject>(
  schema: Instantiable<T>,
  property: string,
  descriptor: TypedPropertyDescriptor<any>
): IPropMetadata<T, any> {
  try {
    return getPropMetadata(schema, property);
  }
  catch {
    /** Get the property constructor */
    const ctor = getPropertyConstructor(schema, property);

    /** Check if is an Array */
    const isArray = Object.getPrototypeOf(ctor) === Array;

    /** Return the default metadata */
    return storePropMetadata(schema, property, {
      descriptor,
      isArray,
      name: property,
      type: ctor
    });
  }
}


/* --------
 * External Utilities
 * -------- */
export function createPropDecorator<T extends AnyObject, TOut, TIn = TOut>(
  defaultOptions?: IPropOptions<T, TOut, TIn>
): TPropDecorator<T, TOut> {
  return function decorateProps(target, property, descriptor) {
    /** Create the new metadata for props */
    const metadata = {
      ...getPropsMetadataOrDefault(target, property, descriptor),
      ...defaultOptions
    };

    /** Store the new metadata to props storage */
    storePropMetadata(target, property, metadata);
  };
}
