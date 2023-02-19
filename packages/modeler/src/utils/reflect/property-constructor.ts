import type { AnyObject, Instantiable } from '@proedis/types';
import { Guard } from '@proedis/utils';

import { DecoratorKeys } from '../../constants';

import InvalidPropertyConstructor from '../../errors/InvalidPropertyConstructor';


/**
 * Starting from a given schema, use Reflect methods to retrieve
 * the constructor of a specific property
 * @param schema
 * @param prop
 */
export function getPropertyConstructor<T extends AnyObject>(schema: Instantiable<T>, prop: string): Instantiable<any> {
  /** Extract the constructor using predefined Reflect get metadata function */
  const ctor = Reflect.getMetadata(DecoratorKeys.Type, schema, prop);

  /** Assert the constructor exists before return */
  return Guard.andThrow(InvalidPropertyConstructor, prop).ifNil(ctor);
}
