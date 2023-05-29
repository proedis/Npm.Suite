import * as React from 'react';

import { useListState } from '@mantine/hooks';

import { useSyncedRef } from '@proedis/react';


/* --------
 * Internal Types
 * -------- */
interface UseSyncedListStateOptions<T> {
  /** Handle the reorder event */
  onSortEnd?: (list: T[]) => void;
}


/* --------
 * Hook Definition
 * -------- */
export function useSyncedListState<T>(
  initialValues: T[] = [],
  options: UseSyncedListStateOptions<T> = {}
): ReturnType<typeof useListState<T>> {


  // ----
  // Options Destruct
  // ----
  const { onSortEnd } = options;


  // ----
  // Internal Hook
  // ----
  const [ list, handlers ] = useListState(initialValues);


  // ----
  // Synced Handlers
  // ----
  const setStateHandler = useSyncedRef(handlers.setState);


  // ----
  // Internal Handlers
  // ----
  const reorder = React.useCallback(
    ({ from, to }: { from: number, to: number }) => {
      /** Update the list */
      setStateHandler.current((current) => {
        /** Internal list reordering */
        const cloned = [ ...current ];
        const item = current[from];

        cloned.splice(from, 1);
        cloned.splice(to, 0, item);

        /** Call user defined handler if exists */
        if (typeof onSortEnd === 'function') {
          onSortEnd(cloned);
        }

        /** Return reordered */
        return cloned;
      });
    },
    [ onSortEnd, setStateHandler ]
  );


  // ----
  // Update list on source change
  // ----
  React.useEffect(
    () => {
      setStateHandler.current(initialValues);
    },
    [ initialValues, setStateHandler ]
  );


  // ----
  // Hook Return
  // ----
  return [
    list,
    {
      ...handlers,
      reorder
    }
  ];

}
