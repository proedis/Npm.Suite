import isNil from '../isNil';


/**
 * Check if a value is a plain object.
 *
 * "Plain" here means *not* nil and *not* an array — which is what the `typeof` operator on its
 * own fails to tell you, since it happily answers `'object'` for both `null` and `[]`.
 *
 * Note that class instances, `Date`, `Map` and every other non literal object still pass: the
 * check is about the value being a keyed container, not about its prototype.
 *
 * @param value The value to check
 * @returns `true` when the value is a non nil, non array object
 *
 * @example
 * isObject({ a: 1 });     // true
 * isObject(new Date());   // true — it is still an object
 * isObject([ 1, 2 ]);     // false
 * isObject(null);         // false
 */
export default function isObject(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && !isNil(value) && !Array.isArray(value);
}
