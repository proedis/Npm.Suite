import hasher from 'object-hash';


/**
 * Compute a stable SHA-1 hash of any value.
 *
 * Built for change detection: hash the old value, hash the new one, compare the two strings.
 * It is a good deal cheaper than a deep equality walk when the same value is compared over and
 * over, which is precisely what a subscription or a memoized selector does.
 *
 * The hash is **order sensitive** on purpose — object keys, array items and set members all
 * count in the order they appear, so `{ a: 1, b: 2 }` and `{ b: 2, a: 1 }` hash differently.
 * A nil value is normalised to `null` first, so `undefined` and `null` share one hash.
 *
 * @param value The value to hash
 * @returns The SHA-1 hash, as a hexadecimal string
 *
 * @example
 * getHash({ id: 1 }) === getHash({ id: 1 }); // true
 * getHash({ a: 1, b: 2 }) === getHash({ b: 2, a: 1 }); // false, key order matters
 *
 * @remarks
 * ⚠️ SHA-1 is used here as a fast fingerprint, never as a security primitive. Do not hash a
 * secret with it and do not treat a collision as impossible.
 */
export default function getHash(value: any): string {
  return hasher(value ?? null, {
    unorderedArrays : false,
    unorderedSets   : false,
    unorderedObjects: false
  });
}
