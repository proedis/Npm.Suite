import get from 'get-value';

import isObject from './isObject';

import type { AnyObject, ObjectPath, ValueAtPath } from '@proedis/types';


export default function getValueAt<Values extends AnyObject, Path extends ObjectPath<Values> = ObjectPath<Values>>(
  values: Values,
  path: Path
): ValueAtPath<Values, Path> {

  /** Assert object is a valid object type */
  if (!isObject(values)) {
    throw new Error(`Invalid object provided to getValueAt function. Expected object, received ${typeof values}`);
  }

  /** Use the underlying module function */
  return get(values, path, { default: null }) as ValueAtPath<Values, Path>;

}
