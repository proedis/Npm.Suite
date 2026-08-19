import get from 'get-value';

import type { AnyObject, ObjectPath, ValueAtPath } from '@proedis/types';
import isObject from './isObject';


/**
 * Read the value found at a dot notation path of an object.
 *
 * The path is typed against the object, so an invalid one is a compile error and the editor
 * autocompletes the valid ones while you type. The return type follows the path: reading
 * `'server.port'` off a `{ server: { port: number } }` gives you a `number`, not an `any`.
 *
 * Array indexes are part of the supported syntax, so a path may cross a collection
 * (`'items.0.label'`).
 *
 * @param values The object to read from
 * @param path The dot notation path to read
 * @returns The value at that path, or `undefined` when the path cannot be walked at runtime
 * @throws {Error} When the first argument is not a plain object
 *
 * @example
 * const settings = { server: { host: 'localhost', port: 8080 }, tags: [ 'a', 'b' ] };
 *
 * getValueAt(settings, 'server.port'); // 8080, typed as number
 * getValueAt(settings, 'tags.1');      // 'b'
 * getValueAt(settings, 'server.nope'); // ❌ compile error, not a valid path
 *
 * @remarks
 * A path that is statically valid can still fail to resolve at runtime — an optional property
 * left unset, or an object that does not really match the type it was declared with. That case
 * yields `undefined`, which is already part of the return type whenever the property is
 * optional.
 */
export default function getValueAt<Values extends AnyObject, Path extends ObjectPath<Values> = ObjectPath<Values>>(
  values: Values,
  path: Path
): ValueAtPath<Values, Path> {

  /** Assert object is a valid object type */
  if (!isObject(values)) {
    throw new Error(`Invalid object provided to getValueAt function. Expected object, received ${typeof values}`);
  }

  /** Use the underlying module function */
  return get(values, path) as ValueAtPath<Values, Path>;

}
