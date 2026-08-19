import set from 'set-value';

import type { AnyObject, ObjectPath, ValueAtPath } from '@proedis/types';
import deepClone from './deepClone';
import getValueAt from './getValueAt';
import isObject from './isObject';


/* --------
 * Internal Types
 * -------- */
interface SetValueAtOptions {
  /**
   * Work on a deep clone of the source object instead of writing into it, leaving the original
   * untouched. Defaults to `false`, which mutates in place.
   */
  immutable?: boolean;
}


/* --------
 * Exported Types
 * -------- */

/**
 * The value to write at a path: either the new value itself, or a function receiving the current
 * value and returning the next one.
 *
 * The updater form is what you want whenever the new value depends on the old one, since it
 * saves a separate {@link getValueAt} call — and keeps the read and the write together.
 */
export type SetValueUpdater<Values extends AnyObject, Path extends ObjectPath<Values>> =
  | ValueAtPath<Values, Path>
  | ((current: ValueAtPath<Values, Path>) => ValueAtPath<Values, Path>);


/* --------
 * Utility Definition
 * -------- */

/**
 * Write a value at a dot notation path of an object, creating any missing intermediate object
 * along the way.
 *
 * Like {@link getValueAt}, the path is typed against the object and so is the value you are
 * allowed to write there — assigning a `string` to a `number` leaf does not compile.
 *
 * ⚠️ **The source object is mutated by default.** Pass `{ immutable: true }` to work on a deep
 * clone instead, which is what you want when the object is React state or anything else that must
 * not change identity silently.
 *
 * @param values The object to write into
 * @param path The dot notation path to write at
 * @param value The new value, or an updater receiving the current one
 * @param options Behavioural options
 * @returns The updated object: the very same reference, or the clone when `immutable` is set
 * @throws {Error} When the first argument is not a plain object
 *
 * @example
 * const settings = { server: { port: 8080 } };
 *
 * setValueAt(settings, 'server.port', 443);
 * // settings.server.port === 443, same object
 *
 * setValueAt(settings, 'server.port', (current) => current + 1);
 * // updater form, reads 443 and writes 444
 *
 * const next = setValueAt(settings, 'server.port', 9000, { immutable: true });
 * // next !== settings, and settings is unchanged
 */
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
  const target = options?.immutable ? deepClone(values) : values;

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
