import dayjs from 'dayjs';

import { Type, Transform } from 'class-transformer';

import { isNil } from '@proedis/utils';

import { combineDecorators } from '../utils';

import type { DecoratorOptions } from '../types';


/**
 * Decorate any class property to be parsed as DayJs object.
 * This function will use current dayjs options to convert plain
 * value into a dayjs object when object is transformed into class,
 * and it will be cast as date object when transforming instance into plain object
 * @param options Optional options passed to Transform decorator
 * @constructor
 */
export function AsDayJs(options?: DecoratorOptions) {
  return combineDecorators(
    /** Always transform plain object into a date object */
    Type(() => Date),
    /** When transforming to instance, use dayjs */
    Transform(
      ({ value }) => !isNil(value) ? Array.isArray(value) ? value.map((v) => dayjs(v)) : dayjs(value) : value,
      { toClassOnly: true, ...options }
    ),
    /** Return a date when cast to plain object */
    Transform(
      ({ value }) => (
        Array.isArray(value)
          ? value.map((v) => !isNil(v) && dayjs.isDayjs(v) ? v.toDate() : undefined).filter(Boolean)
          : !isNil(value) && dayjs.isDayjs(value) ? value.toDate() : null
      ),
      { toPlainOnly: true, ...options }
    )
  );
}
