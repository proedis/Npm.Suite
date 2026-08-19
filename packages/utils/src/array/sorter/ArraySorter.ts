import type { AnyObject } from '@proedis/types';
import ArraySorterStep from './ArraySorterStep';


import type { Comparer, SortDirection, SortOptions } from './types';


/**
 * A multi-step sorter for an array of objects or primitives, built one criterion at a time.
 *
 * Rarely instantiated directly: {@link sorter} is the shorthand entry point. Chaining reads as the
 * SQL-ish thing it mirrors — `orderBy(…).thenByDescending(…).sort()` — and each step only gets a
 * say when every step before it produced a tie.
 *
 * @example
 * import { sorter } from '@proedis/utils';
 *
 * const ordered = sorter(invoices)
 *   .orderBy('customer.name')
 *   .thenByDescending('issuedAt')
 *   .sort({ placeNil: 'before' });
 */
export default class ArraySorter<T extends AnyObject> {


  // ---- //
  // Private properties
  // ---- //

  /**
   * Store the first step of array sorting
   * @private
   */
  private _firstStep: ArraySorterStep<T> | undefined = undefined;


  // ---- //
  // Constructor
  // ---- //

  /**
   * Instantiate a new ArraySorter object to start sorting it using accessor functions
   * @param _data The array to sort, never mutated
   */
  constructor(private readonly _data: T[]) {
  }


  // ---- //
  // Private methods
  // ---- //

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


  // ---- //
  // Public methods
  // ---- //

  /**
   * Sort by a first criterion, ascending.
   *
   * @param comparer A typed dot notation path into the item, or an accessor function
   * @returns The sorting step, to chain further criteria or to run the sort
   */
  public orderBy(comparer: Comparer<T>): ArraySorterStep<T> {
    /** Return the new sorter step object instance */
    return this.buildSorterStep(comparer, 'asc');
  }


  /**
   * Sort by a first criterion, descending.
   *
   * @param comparer A typed dot notation path into the item, or an accessor function
   * @returns The sorting step, to chain further criteria or to run the sort
   */
  public orderByDescending(comparer: Comparer<T>): ArraySorterStep<T> {
    /** Return the new sorter step object instance */
    return this.buildSorterStep(comparer, 'desc');
  }


  /**
   * Run the sort and return the ordered array.
   *
   * The source array is **never** mutated: a copy is sorted and handed back, which is what makes
   * this safe to call straight on a React prop or on a value held in state. Calling it before any
   * criterion has been declared returns a copy of the source, untouched.
   *
   * @param options How ties, casing and nil values are handled
   * @returns A new, sorted array
   */
  public sort(options?: SortOptions): T[] {
    /** Clone the first step to ensure is always the same */
    const { _firstStep } = this;

    /**
     * Sort a copy, never the source array.
     * 'Array.prototype.sort' orders in place and returns the very same reference: doing that to an
     * array owned by somebody else — React state, a query result, a prop — is a mutation nobody
     * asked for, and one that produces no re-render while looking like it worked.
     */
    const data = [ ...this._data ];

    /** If no step has been defined, return original data */
    if (!_firstStep) {
      return data;
    }

    /** Sort data using defined steps */
    return data.sort((firstItem, nextItem) => (
      _firstStep.getSortingOrder(firstItem, nextItem, options)
    ));
  }

}
