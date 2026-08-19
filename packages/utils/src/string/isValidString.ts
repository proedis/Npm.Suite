/**
 * Check if a value is a non empty string.
 *
 * The guard every "did the caller actually give me something?" check on a text field reduces
 * to: a `string` type alone does not rule out `''`, which is almost never a valid input.
 *
 * @param value The value to check
 * @returns `true` when the value is a string holding at least one character
 *
 * @example
 * isValidString('proedis'); // true
 * isValidString('');        // false
 * isValidString(null);      // false
 * isValidString(42);        // false
 */
export default function isValidString(value: unknown): value is string {
  return typeof value === 'string' && !!value.length;
}
