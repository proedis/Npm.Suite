import set from 'set-value';
import cloneDeep from 'clone-deep';

import getValueAt from './getValueAt';
import isObject from './isObject';

import type { AnyObject, ObjectPath, ValueAtPath } from '@proedis/types';


/* --------
 * Internal Types
 * -------- */
interface SetValueAtOptions {
  /** Create a deep clone of the object before returning it, default false */
  immutable?: boolean;
}


/* --------
 * Exported Types
 * -------- */
export type SetValueUpdater<Values extends AnyObject, Path extends ObjectPath<Values>> =
  | ValueAtPath<Values, Path>
  | ((current: ValueAtPath<Values, Path>) => ValueAtPath<Values, Path>);


/* --------
 * Utility Definition
 * -------- */
export default function setValueAt<Values extends AnyObject, Path extends ObjectPath<Values> = ObjectPath<Values>>(
  values: Values,
  path: Path,
  value: SetValueUpdater<Values, Path>,
  options?: SetValueAtOptions
): Values {

  /** Assert the object is a valid object type */
  if (!isObject(values)) {
    throw new Error(`Invalid object provided to setValueAt function. Expected object, received ${typeof values}`);
  }

  /** Create (or keep) the value to merge according to immutable options */
  const target = options?.immutable ? cloneDeep(values) : values;

  /** If provided value is plain, set without extracting data */
  if (typeof value !== 'function') {
    set(target, path, value, { merge: true });
  }
  else {
    // noinspection UnnecessaryLocalVariableJS
    /** Else, extract current value and use to compute the next value to set */
    const valueUpdater: ((current: ValueAtPath<Values, Path>) => ValueAtPath<Values, Path>) = value;
    set(target, path, valueUpdater(getValueAt(target, path)), { merge: true });
  }

  /** Return updated target */
  return target;

}
