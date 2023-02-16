import merge from 'ts-deepmerge';

import type { AnyObject } from '@proedis/types';


/**
 * The ts-deepmerge package seems to be broken with
 * some build configuration (like NextJS default configuration).
 * Workaround building a function to return valid
 * deepmerge function (avoiding using bundler).
 * @param m
 */
function getMergeDefault(m: any): typeof merge {
  if (m && typeof m.default === 'function') {
    return m.default;
  }
  else if (m && !!(m.default as any)) {
    return getMergeDefault(m.default as any);
  }

  throw new Error('Could not get ts-deepmerge default');
}


/**
 * Merge two or more objects recursively, resulting in one object.
 * @param objects
 */
export default function mergeObjects<T extends AnyObject>(...objects: Partial<T>[]): T {
  // @ts-ignore
  return getMergeDefault(merge)(...objects) as T;
}
