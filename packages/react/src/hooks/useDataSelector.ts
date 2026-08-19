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
  const [ requestedSelection, setRequestedSelection ] = React.useState<T | undefined>(options?.defaultSelected);


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
      setRequestedSelection(item);
    },
    []
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
  /**
   * Resolve the requested selection against the data as it is *now*, while rendering.
   *
   * 'getSourceItem' already answers every case the reconciliation has to cover: it returns the matching
   * source item, or 'undefined' when the requested one is not in the data any more — and 'undefined' in,
   * 'undefined' out. So the whole thing is one derivation.
   *
   * It used to be an effect that called setState, which meant every data change that invalidated the
   * selection rendered twice: once with the stale selection, once with the corrected one. Deriving it
   * here means a render never shows a selection the data does not back.
   */
  const selected = getSourceItem(requestedSelection);


  // ----
  // Selection Change Notification
  // ----
  /**
   * Notify the consumer once per actual change, from a single place.
   *
   * There used to be two sources for this callback — a synchronous call inside the setter and the
   * reconciliation effect calling that same setter — and between them they reported things that were not
   * changes: selecting what was already selected notified, clearing an already empty selection notified
   * twice, and resolving `defaultSelected` against the data notified at mount. Watching the resolved
   * value reports each transition exactly once, after the commit that made it real.
   */
  const lastNotifiedSelection = React.useRef(selected);

  React.useEffect(
    () => {
      if (lastNotifiedSelection.current === selected) {
        return;
      }

      lastNotifiedSelection.current = selected;

      const { current: currentUserDefinedOnSelectChange } = userDefinedOnSelectChange;
      if (typeof currentUserDefinedOnSelectChange === 'function') {
        currentUserDefinedOnSelectChange(selected);
      }
    },
    [ selected, userDefinedOnSelectChange ]
  );


  // ----
  // Unmount Notification
  // ----
  /**
   * Report the selection as gone when the component unmounts.
   *
   * This was `useUnmountEffect(clearSelected)`, and it notified only as a side effect of how the
   * callback used to be wired: `clearSelected` went through the setter, and the setter notified
   * synchronously. Now that notifying belongs to an effect — and effects do not run on the way out —
   * that call became inert, which dropped a notification every consumer had always received.
   *
   * It fires unconditionally, which is what the old path did: it resolved `undefined` through
   * `getSourceItem` and reported it even when nothing was selected to begin with.
   */
  useUnmountEffect(() => {
    const { current: currentUserDefinedOnSelectChange } = userDefinedOnSelectChange;

    if (typeof currentUserDefinedOnSelectChange === 'function') {
      currentUserDefinedOnSelectChange(undefined);
    }
  });


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
