import { Transform } from 'class-transformer';

import { isNil } from '@proedis/utils';

import { combineDecorators } from '../utils';

import { TimeSpan } from '../mappers';

import type { DecoratorOptions } from '../types';


export function AsTimeSpan(options?: DecoratorOptions) {
  return combineDecorators(
    /** When transform a plain object into instance, create a new TimeSpan */
    Transform(
      ({ value }) => !isNil(value) ? TimeSpan.parse(value) : null,
      { toClassOnly: true, ...options }
    ),
    /** When casting the instance into a plain object, transform the TimeSpan into a string */
    Transform(
      ({ value }) => TimeSpan.isTimeSpan(value) ? value.toString() : null,
      { toPlainOnly: true, ...options }
    )
  );
}
