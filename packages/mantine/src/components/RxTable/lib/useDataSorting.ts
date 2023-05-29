import * as React from 'react';

import { sorter } from '@proedis/utils';
import type { Comparer } from '@proedis/utils';

import type { AnyObject } from '@proedis/types';

import { useAutoControlledState } from '@proedis/react';

import type { RxTableColumn } from './useColumns';


/* --------
 * Internal Types
 * -------- */
export interface UseDataSortingConfig<Data extends AnyObject> {
  /** Set initial reverse sorting */
  defaultReverseSorting?: boolean;

  /** Set initial sorting column */
  defaultSort?: string;

  /** Callback handler fired when sort is changing */
  onSortChange?: (sorting: Comparer<Data>[], reverse: boolean) => void;

  /** Manual control reverse sorting */
  reverseSorting?: boolean;

  /** Manual control sorting */
  sort?: Comparer<Data>[];
}

type UseDataSortingConfigAndData<Data extends AnyObject> = UseDataSortingConfig<Data> & {
  /** The array of columns */
  columns: RxTableColumn<Data>[];

  /** Data to sort */
  data: Data[];
};


export interface DataSorted<Data extends AnyObject> {
  /** Check if is actual sorting reversed */
  isSortReversed: boolean;

  /** Handler to change sorting */
  setSorting: (newSorting: Comparer<Data>[], reverse: boolean) => void;

  /** Sorted Data */
  sortedData: Data[];

  /** Applied Sorting */
  sorting: Comparer<Data>[];
}


/* --------
 * Hook definition
 * -------- */
export default function useDataSorting<Data extends AnyObject>(config: UseDataSortingConfigAndData<Data>): DataSorted<Data> {

  const {
    columns,
    data,
    defaultReverseSorting,
    defaultSort,
    onSortChange,
    reverseSorting,
    sort
  } = config;


  // ----
  // Define internal State
  // ----
  const [ sorting, trySetSorting ] = useAutoControlledState<Comparer<Data>[]>([], {
    defaultValue: typeof defaultSort === 'string' ? columns.find(c => c.key === defaultSort)?.sort : undefined,
    value       : sort
  });

  const [ isSortReversed, trySetReverseSorting ] = useAutoControlledState(false, {
    defaultValue: defaultReverseSorting,
    value       : reverseSorting
  });


  // ----
  // Handlers
  // ----
  const handleChangeSorting = React.useCallback(
    (newSorting: Comparer<Data>[], reverse: boolean) => {
      /** Check if sorting is changed */
      const isSortChanged = newSorting !== sorting;
      const isReversingChanged = reverse !== isSortReversed;

      /** If no change, return */
      if (!isSortChanged && !isReversingChanged) {
        return;
      }

      /** Call user defined handler */
      if (onSortChange) {
        onSortChange(newSorting, reverse);
      }

      /** Try to set new Sorting */
      if (isSortChanged) {
        trySetSorting(newSorting);
      }

      if (reverse !== isSortReversed) {
        trySetReverseSorting(reverse);
      }
    },
    [ onSortChange, isSortReversed, sorting, trySetReverseSorting, trySetSorting ]
  );


  // ----
  // Memoized Sorted Data
  // ----
  const sortedData = React.useMemo<Data[]>(
    () => {
      if (sorting.length) {
        const sorterInstance = sorting.slice(1).reduce((s, next) => (
          isSortReversed ? s.thenByDescending(next) : s.thenBy(next)
        ), isSortReversed ? sorter(data).orderByDescending(sorting[0]) : sorter(data).orderBy(sorting[0]));

        return sorterInstance.sort();
      }

      return data;
    },
    [ data, isSortReversed, sorting ]
  );


  // ----
  // Return Data and handler
  // ----
  return {
    sortedData,
    setSorting: handleChangeSorting,
    isSortReversed,
    sorting
  };

}
