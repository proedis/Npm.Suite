import { merge } from 'ts-deepmerge';

import type { AnyObject } from '@proedis/types';


/**
 * Merge two or more objects recursively into a single new object.
 *
 * Sources are applied left to right, so the rightmost one wins on any leaf they both define.
 * Nested objects are merged key by key rather than replaced wholesale, which is what makes this
 * the right tool for layering a set of overrides on top of a defaults object.
 *
 * **Arrays are replaced, not concatenated**: `{ tags: [ 'a' ] }` merged with `{ tags: [ 'b' ] }`
 * gives `{ tags: [ 'b' ] }`. That is the semantics an override layer needs — the underlying module
 * concatenates by default, which silently doubles up on anything list shaped, an axios
 * `transformResponse` included. Objects nested inside an array are not merged item by item either:
 * the array is a value, and the rightmost one wins.
 *
 * The inputs are never mutated: a brand new object comes out.
 *
 * @param objects The objects to merge, in increasing order of priority
 * @returns A new object holding the merged result, or an empty object when nothing was passed
 *
 * @example
 * mergeObjects(
 *   { server: { host: 'localhost', port: 80 }, tags: [ 'base' ] },
 *   { server: { port: 443 }, tags: [ 'extra' ] }
 * );
 * // { server: { host: 'localhost', port: 443 }, tags: [ 'extra' ] }
 */
export default function mergeObjects<T extends AnyObject>(...objects: Partial<T>[]): T {
  /** Nothing to merge: hand back an empty object instead of relying on the underlying module */
  if (!objects.length) {
    return {} as T;
  }

  return merge.withOptions({ mergeArrays: false }, ...objects) as T;
}
