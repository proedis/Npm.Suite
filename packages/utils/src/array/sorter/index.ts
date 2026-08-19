import type { AnyObject } from '@proedis/types';
import ArraySorter from './ArraySorter';


/* --------
 * Export the function to build the Sorter
 * -------- */

/**
 * Start a sorting chain over an array.
 *
 * The shorthand entry point of {@link ArraySorter}, and the one to reach for: declare the criteria
 * with `orderBy` / `thenBy`, then call `sort()` to get a new, ordered array back.
 *
 * @param data The array to sort, never mutated
 * @returns The sorter, waiting for its first criterion
 *
 * @example
 * import { sorter } from '@proedis/utils';
 *
 * const ordered = sorter(users)
 *   .orderByDescending('isActive')
 *   .thenBy('profile.displayName')
 *   .sort();
 */
export default function sorter<T extends AnyObject>(data: T[]): ArraySorter<T> {
  /** Return the sorter */
  return new ArraySorter<T>(data);
}
