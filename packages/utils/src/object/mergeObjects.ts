import merge from 'ts-deepmerge';

import type { AnyObject } from '@proedis/types';


/**
 * Merge two or more objects recursively, resulting in one object.
 * @param objects
 */
export default function mergeObjects<T extends AnyObject>(...objects: Partial<T>[]): T {
  return merge(...objects) as T;
}
