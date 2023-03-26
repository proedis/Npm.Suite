import type { AnyObject, Instantiable } from '@proedis/types';

import type { EntityType } from './Entity';
import type { TForwarded } from './Forwarded';


/**
 * An identity represents the unique identifier of the Model
 * and is restricted to be only string or number primitive type
 */
export type TIdentityType = string | number;


/**
 * The prop metadata object is an object that will be stored
 * into the prop storage of the object and has all the
 * key and the options relative to the prop
 */
export interface IPropMetadata<T extends AnyObject, TOut = any, TIn = TOut>
  extends IPropOptions<T, TOut, TIn> {
  /** Typed descriptor retrieved by the decorator function */
  descriptor: TypedPropertyDescriptor<TOut> | undefined;

  /** Indicate if the property is an Array of elements */
  isArray: boolean;

  /** Indicate if a property has to be considered a method */
  isMethod: boolean;

  /** Indicate if a property has to be considered a virtual property, doesn't be reflected from the original object */
  isVirtual: boolean;

  /** The property name to use while reflecting data */
  name: Exclude<keyof T, number>;

  /** When the property is defined as a Method, the return type represents the result of the function */
  returnType: Instantiable<any> | undefined;

  /** Define the real type of the value for the prop */
  type: Instantiable<any> | TForwarded;
}


/**
 * Property options that could be passed to the decorator
 * function and that will extend the base prop metadata object
 * stored into the prop storage
 */
export interface IPropOptions<T extends AnyObject, TOut = any, TIn = TOut> {
  /** Set an alias for the property name, used to reflect property value */
  alias?: string;

  /** Optionally set a starting default value for the prop if incoming value is undefined */
  default?: TOut | ((doc: EntityType<T>) => TOut);

  /** Define a custom getter function that will replace the default one */
  get?: (value: TIn) => TOut;

  /** Define the Property as the identity of the Entity */
  isIdentity?: boolean;

  /** Protect the property value from any type of change */
  protect?: boolean;

  /** Define a custom setter function that will replace the default one */
  set?: (value: TOut) => TIn;
}
