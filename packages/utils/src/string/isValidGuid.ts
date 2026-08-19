import isValidString from './isValidString';


/* --------
 * Constants
 * -------- */

/**
 * The canonical 8-4-4-12 hexadecimal form, case insensitive.
 *
 * Note the deliberate absence of the global flag: a regular expression carrying `g` keeps a
 * mutable `lastIndex` across `test()` calls, so the very same valid value would alternate
 * between `true` and `false` on consecutive checks.
 */
const GUID_PATTERN = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i;


/**
 * Check if a value is a string holding a well formed GUID / UUID.
 *
 * Only the shape is validated: any of the standard 8-4-4-12 hexadecimal groups is accepted,
 * with no assumption about the UUID version or variant bits. The braced (`{…}`) and urn
 * (`urn:uuid:…`) representations are **not** accepted.
 *
 * @param value The value to check
 * @returns `true` when the value is a string matching the canonical GUID form
 *
 * @example
 * isValidGuid('3f2504e0-4f89-11d3-9a0c-0305e82c3301'); // true
 * isValidGuid('3F2504E0-4F89-11D3-9A0C-0305E82C3301'); // true, case insensitive
 * isValidGuid('{3f2504e0-4f89-11d3-9a0c-0305e82c3301}'); // false, braced form
 * isValidGuid('not-a-guid'); // false
 */
export default function isValidGuid(value: unknown): value is string {
  return isValidString(value) && GUID_PATTERN.test(value);
}
