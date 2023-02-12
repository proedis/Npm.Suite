import type { GenericObject } from '@proedis/types';

import ArraySorter from './ArraySorter';


/* --------
 * Export the function to build the Sorter
 * -------- */
export default function sorter<T extends GenericObject>(data: T[]): ArraySorter<T> {
  /** Return the sorter */
  return new ArraySorter<T>(data);
}
