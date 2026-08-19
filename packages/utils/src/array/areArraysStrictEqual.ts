type ComparableArray = unknown[] | null | undefined;


/**
 * Check whether two arrays hold the same items, in the same order.
 *
 * Identical references short circuit, anything that is not an array loses immediately, and the
 * remaining case is settled by comparing the JSON serialisation of both sides.
 *
 * ⚠️ That last part is the trade-off to know about. Serialisation is fast and good enough for the
 * arrays of primitives and plain records this is meant for, but it also means that values JSON
 * cannot express are compared by whatever JSON turns them into: `undefined` and functions inside an
 * array both become `null`, a `Date` becomes its ISO string, and two objects holding the same
 * entries in a different key order are reported as different. For anything richer, hash the values
 * with `hasEqualHash` or compare them yourself.
 *
 * @param first The first array
 * @param second The array to compare it against
 * @returns `true` when both are arrays holding the same items in the same order
 *
 * @example
 * areArraysStrictEqual([ 1, 2 ], [ 1, 2 ]);     // true
 * areArraysStrictEqual([ 1, 2 ], [ 2, 1 ]);     // false, order matters
 * areArraysStrictEqual(null, null);             // true, same reference
 * areArraysStrictEqual([ 1 ], null);            // false
 */
export function areArraysStrictEqual(first: ComparableArray, second: ComparableArray): boolean {
  /** Strict check if they are equals */
  if (first === second) {
    return true;
  }

  /** Assert both are arrays */
  if (!Array.isArray(first) || !Array.isArray(second)) {
    return false;
  }

  /** Use the Json Stringify method to compare string */
  return JSON.stringify(first) === JSON.stringify(second);
}


/**
 * @deprecated Renamed to {@link areArraysStrictEqual} in `2.0.0`, the plural and the adjective
 * finally agreeing with each other. This alias forwards to it and will be removed in the next
 * major.
 */
export const areArrayStrictEquals = areArraysStrictEqual;
