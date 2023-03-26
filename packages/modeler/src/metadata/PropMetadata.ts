import { isNil } from '@proedis/utils';

import type { AnyObject, Instantiable } from '@proedis/types';

import type Entity from '../Entity';

import type { IPropMetadata, IPropOptions } from '../interfaces';
import { InstantiableType } from '../constants';


export default class PropMetadata<T extends AnyObject, TOut = any, TIn = TOut> {

  // ----
  // Prop Metadata Constructor
  // ----
  constructor(
    private readonly _metadata: IPropMetadata<T, TOut, TIn>
  ) {
  }


  // ----
  // Public Accessor
  // ----
  get name(): string {
    return this._metadata.name as string;
  }


  get sourceKey(): string {
    return (this._metadata.alias ?? this._metadata.name) as string;
  }


  // ----
  // Utilities
  // ----
  public editOptions(update: (options: IPropOptions<T>) => void) {
    update(this._metadata);
  }


  // ----
  // Helpers
  // ----

  /**
   * Get the default value of the property
   * @param entity
   */
  public getDefaultValue(entity: Entity): TOut | null {
    /** If no default has been defined, return null */
    if (isNil(this._metadata.default)) {
      return null;
    }

    /** If the default is a function, call and return value */
    if (typeof this._metadata.default === 'function') {
      return (this._metadata.default as Function)(entity) ?? null;
    }

    /** Return plain default */
    return this._metadata.default as TOut;
  }


  /**
   * Starting from any type of value, this function will
   * return the value cast using the described type
   * @param value
   */
  public castValue(value: any): TOut | null {
    /** If the value is nil, return the system default value */
    if (isNil(value)) {
      return this._metadata.isArray ? ([] as TOut) : null;
    }

    /** Get the Caster constructor function */
    const Caster = this._metadata.type;

    /** If the prototype of value is the same of the caster, there is no need to cast value */
    if (Object.getPrototypeOf(value) === Caster) {
      return value;
    }

    /** Otherwise, use the Caster to transform the value */
    switch (Caster) {
      /** When using boolean, the caster will convert string or number into valid boolean value */
      case Boolean:
        return (value === 'true' || value === '1' || value === 1 || value === true) as TOut;

      /** The number caster will try to convert any value into a valid number, falling back to null */
      case Number:
        const castedAsNumber = Number(value);
        return Number.isNaN(castedAsNumber) ? null : castedAsNumber as TOut;

      /** The string caster will simply convert any type of value into a string using base Constructor */
      case String:
        return String(value) as TOut;

      /** The default caster will check if a Forwarded type has been requested */
      default:
        if (typeof Caster === 'object' && Caster.type === InstantiableType.Forwarded) {
          const Forwarded = Caster.constructor();
          return new Forwarded(value);
        }

        return new (Caster as Instantiable<any>)(value);
    }
  }


  /**
   * Extract the source value from Entity Object and cast
   * to the described type
   * @param entity
   */
  public getValue(entity: Entity): TOut | null {
    return this.castValue(entity._source[this.sourceKey]) ?? this.getDefaultValue(entity);
  }

}
