import * as React from 'react';

import { useSyncedRef } from './useSyncedRef';
import { useUnmountEffect } from './useUnmountEffect';


/* --------
 * Internal Types
 * -------- */
interface UseDataSelectorOptions<T> {
  /** Manually change the compare function to check if an item could be selected or not */
  comparer?: (item: T, source: T) => boolean;

  /** Set the initial default selected item */
  defaultSelected?: T;

  /** A function to call every time the selected item changed */
  onSelectedChange?: (selected: T | undefined) => void;
}

interface UseDataSelectorReturn<T> {
  /** Clear the selected item */
  clearSelected: () => void;

  /** Create a function that could be used to return a function to select item */
  createSelectorHandler: (item: T | undefined) => () => void;

  /** The current selected item */
  selected: T | undefined;

  /** Set the selected item */
  setSelected: (item: T | undefined) => void;
}


/* --------
 * Hook Definition
 * -------- */

/**
 * Create a set of utilities to select and item from an array source
 * and to automatically assert the selected item is always valid
 * @param data Array data source
 * @param options
 */
export function useDataSelector<T>(
  data: T[] | null | undefined,
  options?: UseDataSelectorOptions<T>
): UseDataSelectorReturn<T> {

  // ----
  // Internal State
  // ----
  const [ selected, setSelectedBase ] = React.useState<T | undefined>(options?.defaultSelected);


  // ----
  // Internal Hooks
  // ----
  const userDefinedOnSelectChange = useSyncedRef(options?.onSelectedChange);
  const userDefinedComparer = useSyncedRef(options?.comparer);


  // ----
  // Handlers & Callbacks
  // ----
  const getSourceItem = React.useCallback(
    (item: T | undefined): T | undefined => {
      /** Undefined item could always be selected */
      if (item === undefined) {
        return undefined;
      }

      /** Assert selectable data is always an array */
      const selectableData = Array.isArray(data) ? data : [];

      /** If a user-defined function exists, use it to check if the item could be selected or not */
      const { current: currentComparer } = userDefinedComparer;
      if (typeof currentComparer === 'function') {
        return selectableData.find((value) => currentComparer(item, value));
      }

      /** Else return a simple object reference check */
      return selectableData.includes(item) ? item : undefined;
    },
    [ data, userDefinedComparer ]
  );

  const setSelected = React.useCallback(
    (item: T | undefined) => {
      const sourceItem = getSourceItem(item);

      setSelectedBase(sourceItem);

      const { current: currentUserDefinedOnSelectChange } = userDefinedOnSelectChange;
      if (typeof currentUserDefinedOnSelectChange === 'function') {
        currentUserDefinedOnSelectChange(sourceItem);
      }
    },
    [ getSourceItem, userDefinedOnSelectChange ]
  );

  const clearSelected = React.useCallback(
    () => setSelected(undefined),
    [ setSelected ]
  );

  const createSelectorHandler = React.useCallback(
    (item: T | undefined) => () => setSelected(item),
    [ setSelected ]
  );


  // ----
  // Selected Assertion
  // ----
  React.useEffect(
    () => {
      /** Get source item from data */
      const sourceItem = getSourceItem(selected);

      /** If selected exists, but source item not, remove selection */
      if (selected && !sourceItem) {
        setSelected(undefined);
      }
      /** If both items exist, but are different, replace selection */
      else if (!!selected && !!sourceItem && selected !== sourceItem) {
        setSelected(sourceItem);
      }
    },
    [ getSourceItem, setSelected, selected ]
  );


  // ----
  // Clear Selected on Unmount
  // ----
  useUnmountEffect(clearSelected);


  // ----
  // Return utilities
  // ----
  return {
    clearSelected,
    createSelectorHandler,
    selected,
    setSelected
  };

}


useDataSelector.idComparer = <T extends { id: any }>(first: T, second: T): boolean => (
  first.id === second.id
);
