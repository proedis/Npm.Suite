import isObject from './isObject';


/**
 * Check if a value is a *plain* object: an object literal, or one built with `Object.create(null)`.
 *
 * The difference from {@link isObject} is the prototype. `isObject` answers "is this a keyed,
 * non array container", which a `Date`, a `Map` and every class instance also are. This one answers
 * "is this a bag of keys and nothing else", which is the question to ask before iterating a value's
 * own keys, deciding whether to recurse into it, or treating it as a set of options.
 *
 * @param value The value to check
 * @returns `true` when the value is an object literal or a null-prototype object
 *
 * @example
 * isPlainObject({ a: 1 });              // true
 * isPlainObject(Object.create(null));   // true
 * isPlainObject(new Date());            // false — it has its own prototype
 * isPlainObject(new Map());             // false
 * isPlainObject([ 1 ]);                 // false
 *
 * @remarks
 * The check is prototype based, so an object created in a different JavaScript realm — another
 * iframe, a Node `vm` context — is reported as *not* plain, since its `Object.prototype` is a
 * different one.
 */
export default function isPlainObject(value: unknown): value is Record<string, any> {
  if (!isObject(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);

  return prototype === null || prototype === Object.prototype;
}
