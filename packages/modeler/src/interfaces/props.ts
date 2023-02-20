import type { AnyObject, Instantiable } from '@proedis/types';

import type { TForwardedInstantiable } from './generics';

import type Document from '../Document';


/**
 * Represent a property decorator function that
 * could be used to decorate schema internal properties
 */
export type TPropDecorator<T extends AnyObject, TOut> = (
  /** The target property */
  target: Instantiable<T>,
  /** The property name */
  property: string,
  /** The typed property descriptor */
  descriptor: TypedPropertyDescriptor<TOut>
) => void;


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
export interface IPropMetadata<T extends AnyObject, TOut, TIn = TOut>
  extends IPropOptions<T, TOut, TIn> {
  /** Typed descriptor retrieved by the decorator function */
  descriptor: TypedPropertyDescriptor<TOut>;

  /** Indicate if the property is an Array of elements */
  isArray?: boolean;

  /** Indicate if the property has to be considered the unique identifier of the model */
  isIdentity?: boolean;

  /** Indicate if a property has to be considered a virtual property, doesn't be reflected from the original object */
  isVirtual?: boolean;

  /** The property name to use while reflecting data */
  name: string;

  /** Define the real type of the value for the prop */
  type: Instantiable<any> | TForwardedInstantiable<any>;
}


/**
 * Property options that could be passed to the decorator
 * function and that will extend the base prop metadata object
 * stored into the prop storage
 */
export interface IPropOptions<T extends AnyObject, TOut, TIn = TOut> {
  /** Set an alias for the property name, used to reflect property value */
  alias?: string;

  /** Define a custom getter function that will replace the default one */
  get?: (value: TIn) => TOut;

  /** Optionally set a starting default value for the prop if incoming value is undefined */
  default?: TOut | ((doc: Document<T>) => TOut);

  /** Set if the property must be exposed while converting the document into an object, default to `true` */
  expose?: boolean;

  /** Protect the property value from any type of change */
  protect?: boolean;

  /** Define a custom setter function that will replace the default one */
  set?: (value: TOut) => TIn;
}
