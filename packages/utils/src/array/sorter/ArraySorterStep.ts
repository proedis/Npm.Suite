import * as dayjs from 'dayjs';
import naturalCompare from 'natural-compare';

import type { AnyObject } from '@proedis/types';

import { getValueAt } from '../../object';

import type ArraySorter from './ArraySorter';

import type { ISortable } from '../contracts';
import type { ComparableFieldType, Comparer, SortDirection, SortOptions } from './types';


export default class ArraySorterStep<T extends AnyObject> {

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
      throw new Error('Sorting is valid only for item of the same type');
    }

    /** Continue with the next sorting step only if the two value are equal */
    if (allNil || firstComparableValue == nextComparableValue) {
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
   * Returns a comparable value for the given input value.
   *
   * @param {any} value - The input value to convert into a comparable value.
   * @returns {ComparableFieldType} - The converted comparable value.
   * @throws {Error} - Throws an error if the value is not a supported type.
   */
  private getComparableValue(value: any): ComparableFieldType {
    /** Check if the value is already one of the valid comparable value types */
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === null || value === undefined) {
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
