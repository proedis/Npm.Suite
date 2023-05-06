import type { AnyObject } from '@proedis/types';

import ArraySorterStep from './ArraySorterStep';

import type { Comparer, SortDirection, SortOptions } from './types';


/**
 * Create a new instance of ArraySorter, a special
 * class that will enable multiple sorting function
 * for an array of primitive/objects
 */
export default class ArraySorter<T extends AnyObject> {


  /**
   * Store the first step of array sorting
   * @private
   */
  private _firstStep: ArraySorterStep<T> | undefined = undefined;


  /**
   * Instantiate a new ArraySorter object to start
   * sorting it using accessor functions
   * @param _data
   */
  constructor(private readonly _data: T[]) {
  }


  /**
   * Build the next step of ArraySorting
   * @param comparer
   * @param direction
   * @private
   */
  private buildSorterStep(comparer: Comparer<T>, direction: SortDirection): ArraySorterStep<T> {
    /** Return the new sorter step object instance */
    this._firstStep = new ArraySorterStep<T>(this, comparer, direction);
    return this._firstStep;
  }


  /**
   * Sort the underlying Array using custom comparare and
   * the 'asc' sort direction
   * @param comparer
   */
  public orderBy(comparer: Comparer<T>): ArraySorterStep<T> {
    /** Return the new sorter step object instance */
    return this.buildSorterStep(comparer, 'asc');
  }


  /**
   * Sort the underlying Array using custom comparare and
   * the 'desc' sort direction
   * @param comparer
   */
  public orderByDescending(comparer: Comparer<T>): ArraySorterStep<T> {
    /** Return the new sorter step object instance */
    return this.buildSorterStep(comparer, 'desc');
  }


  /**
   * Sort the Array of data
   * @param options
   */
  public sort(options?: SortOptions): T[] {
    /** Clone the first step to ensure is always the same */
    const { _firstStep } = this;

    /** If no step has been defined, return original data */
    if (!_firstStep) {
      return this._data;
    }

    /** Sort data using defined steps */
    return this._data.sort((firstItem, nextItem) => (
      _firstStep.getSortingOrder(firstItem, nextItem, options)
    ));
  }

}
