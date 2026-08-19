import isNil from '../isNil';

import getHash from './getHash';


/**
 * Check whether two values still represent the same data.
 *
 * Nil values short circuit — `null` and `undefined` count as equal to each other — objects are
 * compared through their {@link getHash} fingerprint, and anything primitive falls back to a
 * strict comparison. The primitive fast path matters: hashing a number to find out it did not
 * change would be pure overhead.
 *
 * @param oldData The previously known value
 * @param newData The value to compare it against
 * @returns `true` when the two values carry the same data
 *
 * @example
 * hasEqualHash({ id: 1 }, { id: 1 });   // true
 * hasEqualHash({ id: 1 }, { id: 2 });   // false
 * hasEqualHash(null, undefined);        // true, both are nil
 * hasEqualHash('same', 'same');         // true, no hashing involved
 *
 * @remarks
 * Being built on {@link getHash}, this inherits its order sensitivity: two objects holding the
 * same entries in a different order are reported as different.
 */
export default function hasEqualHash(oldData: any, newData: any): boolean {
  /** If old data is a nil object, check if new data is nil too */
  if (isNil(oldData)) {
    return isNil(newData);
  }

  /** If new data is a nil object, check if old data is nil too */
  if (isNil(newData)) {
    return isNil(oldData);
  }

  /** If the two data values are objects, compare the hash */
  if (typeof oldData === 'object' && typeof newData === 'object') {
    return getHash(oldData) === getHash(newData);
  }

  /** If they are primitive values, return strict comparison */
  return oldData === newData;
}
