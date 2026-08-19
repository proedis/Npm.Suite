import { Transform } from 'class-transformer';

import { isNil } from '@proedis/utils';

import { combineDecorators } from '../utils';

import { TimeSpan } from '../mappers';

import type { DecoratorOptions } from '../types';


/**
 * Decorate a class property to be parsed as a {@link TimeSpan}.
 *
 * The plain value is expected in the .NET duration format (`[-][d.]hh:mm:ss[.fff]`) and is turned back
 * into exactly that string when the instance is converted to a plain object, so a value survives a
 * full round trip through an API.
 *
 * @param options Optional options passed to the Transform decorator
 * @constructor
 *
 * @example
 * class Task extends ModelerObject {
 *   @AsTimeSpan()
 *   public estimate!: Nullable<TimeSpan>;
 * }
 */
export function AsTimeSpan(options?: DecoratorOptions) {
  return combineDecorators(
    /** When transform a plain object into instance, create a new TimeSpan */
    Transform(
      ({ value }) => (!isNil(value) ? TimeSpan.parse(value) : null),
      { ...options, toClassOnly: true }
    ),
    /** When casting the instance into a plain object, transform the TimeSpan into a string */
    Transform(
      ({ value }) => (TimeSpan.isTimeSpan(value) ? value.toString() : null),
      { ...options, toPlainOnly: true }
    )
  );
}
