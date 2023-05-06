import naturalCompare from 'natural-compare';

import type { GenericObject } from '@proedis/types';

import { getValueAt } from '../../object';

import type ArraySorter from './ArraySorter';

import type { Comparer, SortDirection, SortOptions } from './types';


export default class ArraySorterStep<T extends GenericObject> {

  /**
   * When sorting by multiple fields and property, save each
   * single step as ArraySorterStep sub sorter function
   * @private
   */
  private _nextStep: ArraySorterStep<T> | undefined = undefined;


  /**
   * Initialize a new step to sort data
   * @param _parentSorter
   * @param _comparer
   * @param _direction
   */
  constructor(
    private readonly _parentSorter: ArraySorter<T>,
    private readonly _comparer: Comparer<T>,
    private readonly _direction: SortDirection
  ) {
  }


  public getSortingOrder(firstItem: T, nextItem: T, options?: SortOptions): number {
    const placement = this.getNaturalSortingOrder(firstItem, nextItem, options);
    return this._direction === 'asc' ? placement : placement * -1;
  }


  private getNaturalSortingOrder(firstItem: T, nextItem: T, options?: SortOptions): number {
    /** Get options and set defaults */
    const {
      compareStringCase = 'insensitive',
      placeFalse = 'after',
      placeNil = 'after'
    } = options || {};

    /** Get item value using comparer accessor function */
    const firstItemValue = typeof this._comparer === 'string' ? getValueAt(firstItem, this._comparer) : this._comparer(
      firstItem);
    const nextItemValue = typeof this._comparer === 'string' ? getValueAt(nextItem, this._comparer) : this._comparer(
      nextItem);
    const allNil = firstItemValue == null && nextItemValue == null;
    const anyNil = firstItemValue == null || nextItemValue == null;

    /** Assert the object type is the same */
    if (!anyNil && typeof firstItemValue !== typeof nextItemValue) {
      throw new Error('Sorting is valid only for item of the same type');
    }

    /** Assert types are valid */
    if (firstItemValue != null && !/string|number|boolean/.test(typeof firstItemValue)) {
      throw new Error(`Only primitive type could be used to sort data. Found ${typeof firstItemValue}`);
    }

    if (nextItemValue != null && !/string|number|boolean/.test(typeof nextItemValue)) {
      throw new Error(`Only primitive type could be used to sort data. Found ${typeof nextItemValue}`);
    }

    /** Continue with the next sorting step only if the two value are equal */
    if (allNil || firstItemValue == nextItemValue) {
      return this._nextStep?.getSortingOrder(firstItem, nextItem, options) ?? 0;
    }

    /** Return sorting order for nil value */
    if (nextItemValue == null) {
      return placeNil === 'after' ? -1 : 1;
    }

    if (firstItemValue == null) {
      return placeNil === 'after' ? 1 : -1;
    }

    /** Check boolean value */
    if (typeof firstItemValue === 'boolean' || typeof nextItemValue === 'boolean') {
      return nextItemValue === false
        ? placeFalse === 'after' ? 1 : -1
        : placeFalse === 'after' ? -1 : 1;
    }

    /** Check number value */
    if (typeof firstItemValue === 'number' || typeof nextItemValue === 'number') {
      return (firstItemValue as number) - (nextItemValue as number);
    }

    /** Natural string comparing */
    return compareStringCase === 'insensitive'
      ? naturalCompare(firstItemValue.toString().toLocaleLowerCase(), nextItemValue.toString().toLocaleLowerCase())
      : naturalCompare(firstItemValue.toString(), nextItemValue.toString());
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


  /**
   * Sort the underlying Array using custom comparare and
   * the 'asc' sort direction
   * @param comparer
   */
  public thenBy(comparer: Comparer<T>): ArraySorterStep<T> {
    /** Return the new sorter step object instance */
    return this.buildSorterStep(comparer, 'asc');
  }


  /**
   * Sort the underlying Array using custom comparare and
   * the 'desc' sort direction
   * @param comparer
   */
  public thenByDescending(comparer: Comparer<T>): ArraySorterStep<T> {
    /** Return the new sorter step object instance */
    return this.buildSorterStep(comparer, 'desc');
  }


  /**
   * Sort the Array of data
   * @param options
   */
  public sort(options?: SortOptions): T[] {
    return this._parentSorter.sort(options);
  }

}
