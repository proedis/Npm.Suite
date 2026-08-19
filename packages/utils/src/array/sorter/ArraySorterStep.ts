import dayjs from 'dayjs';
import naturalCompare from 'natural-compare';

import type { AnyObject } from '@proedis/types';
import { getValueAt } from '../../object';


import type ArraySorter from './ArraySorter';

import type { ComparableFieldType, Comparer, ISortable, SortDirection, SortOptions } from './types';


/**
 * A single criterion of a sorting chain, and the object every `orderBy` / `thenBy` call hands back.
 *
 * A step only gets to decide the order of two items when every step before it called them equal,
 * which is how the chain behaves like a composite sort rather than like three independent ones.
 * Never built directly: {@link ArraySorter} creates them.
 */
export default class ArraySorterStep<T extends AnyObject> {


  // ---- //
  // Private properties
  // ---- //

  /**
   * When sorting by multiple fields and property, save each
   * single step as ArraySorterStep sub sorter function
   * @private
   */
  private _nextStep: ArraySorterStep<T> | undefined = undefined;


  // ---- //
  // Constructor
  // ---- //

  /**
   * Initialize a new step to sort data
   * @param _parentSorter The sorter owning the whole chain, the only one that runs the sort
   * @param _comparer How to get a comparable value out of an item
   * @param _direction The direction this single step runs in
   */
  constructor(
    private readonly _parentSorter: ArraySorter<T>,
    private readonly _comparer: Comparer<T>,
    private readonly _direction: SortDirection
  ) {
  }


  // ---- //
  // Private methods
  // ---- //

  /**
   * Compare two items on this step only, ignoring the declared direction.
   *
   * @param firstItem The first item
   * @param nextItem The item to compare it against
   * @param options How ties, casing and nil values are handled
   * @returns A negative number, zero, or a positive number, as `Array.prototype.sort` expects
   * @throws {Error} When the two values are of different, non nil types
   */
  private getNaturalSortingOrder(firstItem: T, nextItem: T, options?: SortOptions): number {
    /** Get options and set defaults */
    const {
      compareStringCase = 'insensitive',
      placeFalse = 'after',
      placeNil = 'after'
    } = options || {};

    /** Get item value using comparer accessor function */
    const firstItemValue = typeof this._comparer === 'string'
      ? getValueAt(firstItem, this._comparer)
      : this._comparer(firstItem);
    const nextItemValue = typeof this._comparer === 'string'
      ? getValueAt(nextItem, this._comparer)
      : this._comparer(nextItem);

    /** Assert types are valid and cast to valid comparable value */
    const firstComparableValue = this.getComparableValue(firstItemValue);
    const nextComparableValue = this.getComparableValue(nextItemValue);

    const allNil = firstComparableValue == null && nextComparableValue == null;
    const anyNil = firstComparableValue == null || nextComparableValue == null;

    /** Assert the object type is the same */
    if (!anyNil && typeof firstComparableValue !== typeof nextComparableValue) {
      throw new Error(
        'Sorting is valid only for item of the same type, found '
        + `'${typeof firstComparableValue}' and '${typeof nextComparableValue}'`
      );
    }

    /** Continue with the next sorting step only if the two value are equal */
    if (allNil || firstComparableValue === nextComparableValue) {
      return this._nextStep?.getSortingOrder(firstItem, nextItem, options) ?? 0;
    }

    /** Return sorting order for nil value */
    if (nextComparableValue == null) {
      return placeNil === 'after' ? -1 : 1;
    }

    if (firstComparableValue == null) {
      return placeNil === 'after' ? 1 : -1;
    }

    /** Check boolean value */
    if (typeof firstComparableValue === 'boolean' || typeof nextComparableValue === 'boolean') {
      return nextComparableValue === false
        ? placeFalse === 'after' ? 1 : -1
        : placeFalse === 'after' ? -1 : 1;
    }

    /** Check number value */
    if (typeof firstComparableValue === 'number' || typeof nextComparableValue === 'number') {
      return (firstComparableValue as number) - (nextComparableValue as number);
    }

    /** Natural string comparing */
    return compareStringCase === 'insensitive'
      ? naturalCompare(
        (firstComparableValue as string).toString().toLocaleLowerCase(),
        (nextComparableValue as string).toString().toLocaleLowerCase()
      )
      : naturalCompare((firstComparableValue as string).toString(), (nextComparableValue as string).toString());
  }


  /**
   * Reduce any value to something two items can be ordered by.
   *
   * Primitives and nil values pass straight through. An object implementing the {@link ISortable}
   * contract is asked for its own sortable value, a `Date` becomes its epoch milliseconds and a
   * Day.js value its epoch seconds — which is why the sorter compares dates correctly without the
   * caller mapping them first.
   *
   * @param value The value to convert into a comparable value
   * @returns The converted comparable value
   * @throws {Error} When the value is of an unsupported type
   */
  private getComparableValue(value: any): ComparableFieldType {
    /** Check if the value is already one of the valid comparable value types */
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value == null) {
      return value;
    }

    /** Check if received value implements the getSortableValue from ISortable contracts */
    if (typeof (value as ISortable<ComparableFieldType> | any).getSortableValue === 'function') {
      return (value as ISortable<ComparableFieldType>).getSortableValue();
    }

    /** If the value is a Date, it could safely be transformed into a valid number */
    if (value instanceof Date) {
      return value.valueOf();
    }

    /** Some libraries are working with DayJs, so it must be included in comparable values */
    if (dayjs.isDayjs(value)) {
      return value.unix();
    }

    /** Thrown unsupported value type error */
    throw new Error(`Only primitive type, Date and DayJs objects could be used to sort data. Found ${typeof value}`);
  }


  /**
   * Build the next step of ArraySorting
   * @param comparer
   * @param direction
   * @private
   */
  private buildSorterStep(comparer: Comparer<T>, direction: SortDirection): ArraySorterStep<T> {
    /** Return the new sorter step object instance */
    this._nextStep = new ArraySorterStep<T>(this._parentSorter, comparer, direction);
    return this._nextStep;
  }


  // ---- //
  // Public methods
  // ---- //

  /**
   * Compare two items on this step, honouring the declared direction and falling through to the
   * next step when they tie.
   *
   * Public because a step delegates to the following one, not because a consumer is expected to
   * call it.
   *
   * @param firstItem The first item
   * @param nextItem The item to compare it against
   * @param options How ties, casing and nil values are handled
   * @returns A negative number, zero, or a positive number, as `Array.prototype.sort` expects
   */
  public getSortingOrder(firstItem: T, nextItem: T, options?: SortOptions): number {
    const placement = this.getNaturalSortingOrder(firstItem, nextItem, options);
    return this._direction === 'asc' ? placement : placement * -1;
  }


  /**
   * Add a tie breaking criterion, ascending.
   *
   * @param comparer A typed dot notation path into the item, or an accessor function
   * @returns The new sorting step, to chain further criteria or to run the sort
   */
  public thenBy(comparer: Comparer<T>): ArraySorterStep<T> {
    /** Return the new sorter step object instance */
    return this.buildSorterStep(comparer, 'asc');
  }


  /**
   * Add a tie breaking criterion, descending.
   *
   * @param comparer A typed dot notation path into the item, or an accessor function
   * @returns The new sorting step, to chain further criteria or to run the sort
   */
  public thenByDescending(comparer: Comparer<T>): ArraySorterStep<T> {
    /** Return the new sorter step object instance */
    return this.buildSorterStep(comparer, 'desc');
  }


  /**
   * Run the whole chain and return the ordered array, leaving the source untouched.
   *
   * @param options How ties, casing and nil values are handled
   * @returns A new, sorted array
   */
  public sort(options?: SortOptions): T[] {
    return this._parentSorter.sort(options);
  }

}
