import { Transform } from 'class-transformer';

import { isNil } from '@proedis/utils';

import { combineDecorators } from '../utils';

import { Enum } from '../mappers';

import type { DecoratorOptions, EnumName } from '../types';


/**
 * Decorate any class property to be parsed as Enum object.
 * An enum converted to Enum class instance will be converted back
 * to string once the object instance will be transformed into plain object
 * @param name The name of the collection of Enums to parse the value
 * @param options Optional options passed to Transform decorator
 * @constructor
 */
export function AsEnum<C extends EnumName>(name: C, options?: DecoratorOptions) {
  return combineDecorators(
    /** When transform a plain object into instance, create a new enum */
    Transform(
      ({ value }) => !isNil(value) ? Enum.getEnum(name, value) : null,
      { toClassOnly: true, ...options }
    ),
    /** When casting an instance into a plain object, transform the Enum into string */
    Transform(
      ({ value }) => Enum.isEnum(value) ? value.value : null,
      { toPlainOnly: true, ...options }
    )
  );
}
