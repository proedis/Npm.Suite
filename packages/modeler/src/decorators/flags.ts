import { Transform } from 'class-transformer';

import { isNil } from '@proedis/utils';

import { combineDecorators } from '../utils';

import { Flags } from '../mappers';

import type { DecoratorOptions, EnumName } from '../types';


/**
 * Decorate any class property to be parsed as a Flags object.
 * Flags properties won't be null, even if the source value is null.
 * A flag converted to Flags class instance will be converted back to
 * an array of string once the object instance is transformed into plain object
 * @param name The name of the collection of Enums to parse the value
 * @param options Optional options passed to Transform decorator
 * @constructor
 */
export function AsFlags<C extends EnumName>(name: C, options?: DecoratorOptions) {
  return combineDecorators(
    /** When transform a plain object into instance, create a new flags */
    Transform(
      ({ value }) => new Flags(name, !isNil(value) && Array.isArray(value) ? value : []),
      { toClassOnly: true, ...options }
    ),
    /** When casting an instance into a plain object, transform the Enum into string */
    Transform(
      ({ value }) => Flags.isFlag(value) ? value.flags : [],
      { toPlainOnly: true, ...options }
    )
  );
}
