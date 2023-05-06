import type { AnyObject, ObjectPath } from '@proedis/types';


export type Placement = 'after' | 'before';

export type SortDirection = 'asc' | 'desc';

export type ComparableFieldType = string | number | boolean | null | undefined;

export type Comparer<T extends AnyObject> = ObjectPath<T> | ((data: T) => ComparableFieldType);

export interface SortOptions {
  /** Choose string comparison types */
  compareStringCase?: 'sensitive' | 'insensitive';

  /** Choose if falsy value must be placed after or before */
  placeFalse?: Placement;

  /** Choose if nil value must be placed after or before */
  placeNil?: Placement;
}
