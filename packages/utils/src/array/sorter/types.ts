import type { AnyObject, ObjectPath } from '@proedis/types';


/* --------
 * Sorting Primitives
 * -------- */

/** Where a special-cased value goes relative to everything else */
export type Placement = 'after' | 'before';

/** The direction a single sorting step runs in */
export type SortDirection = 'asc' | 'desc';

/**
 * The value types a sorting step knows how to order.
 *
 * Anything else has to be reduced to one of these first — which is what {@link ISortable} exists
 * for, and what the sorter does on its own for `Date` and Day.js values.
 */
export type ComparableFieldType = string | number | boolean | null | undefined;

/**
 * How a sorting step gets a comparable value out of an item.
 *
 * Either a typed dot notation path into the item — autocompleted and compile checked against its
 * type — or an accessor function, for the cases where the value has to be computed.
 *
 * @example
 * sorter(users).orderBy('profile.displayName');            // path form
 * sorter(users).orderBy((user) => user.roles.length);      // accessor form
 */
export type Comparer<T extends AnyObject> = ObjectPath<T> | ((data: T) => ComparableFieldType);


/* --------
 * Sorting Options
 * -------- */

export interface SortOptions {
  /**
   * Whether string comparison takes case into account.
   * @default 'insensitive'
   */
  compareStringCase?: 'sensitive' | 'insensitive';

  /**
   * Where `false` values are placed relative to `true` ones.
   * @default 'after'
   */
  placeFalse?: Placement;

  /**
   * Where nil values — `null` and `undefined` — are placed relative to everything else.
   * @default 'after'
   */
  placeNil?: Placement;
}


/* --------
 * Sorting Contracts
 * -------- */

/**
 * Implement this on a class to make it sortable by the {@link Comparer} path form, without the
 * caller having to know how to reduce it to a primitive.
 *
 * The sorter checks for `getSortableValue` before giving up on an object, so a model implementing
 * this contract can be sorted as if it were a plain value.
 *
 * @example
 * class Money implements ISortable<number> {
 *
 *   constructor(public readonly amount: number, public readonly currency: string) {
 *   }
 *
 *   public getSortableValue(): number {
 *     return this.amount;
 *   }
 *
 * }
 *
 * sorter(invoices).orderByDescending('total').sort(); // total is a Money, and it just works
 */
export interface ISortable<V extends ComparableFieldType> {

  /** Reduce this object to a value the sorter can compare */
  getSortableValue(): V;

}
