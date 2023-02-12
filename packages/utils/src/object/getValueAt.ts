import get from 'get-value';

import isObject from './isObject';

import type { GenericObject, ObjectPath, ValueAtPath } from '@proedis/types';


export default function getValueAt<Values extends GenericObject, Path extends ObjectPath<Values> = ObjectPath<Values>>(
  values: Values,
  path: Path
): ValueAtPath<Values, Path> | null {

  /** Assert object is a valid object type */
  if (!isObject(values)) {
    return null;
  }

  /** Use the underlying module function */
  return get(values, path, { default: null }) as ValueAtPath<Values, Path> | null;

}
