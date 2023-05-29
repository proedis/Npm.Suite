import * as React from 'react';

import { useDataSelector, useSyncedRef } from '@proedis/react';

import type { SelectProps, SelectItem } from '@mantine/core';


/* --------
 * Internal Types
 * -------- */
interface UseSelectOptions<T> {
  /** Set the default selected element */
  defaultSelected?: T | undefined;

  /** Function to get component label */
  getOptionLabel: (element: T) => string;
}


/* --------
 * External Helpers
 * -------- */
function getElementId<T extends { id: string | number }>(element: T): string {
  return typeof element.id === 'number' ? element.id.toString(10) : element.id;
}


/* --------
 * Hook Definition
 * -------- */
export function useSelect<T extends { id: string | number }>(
  list: T[],
  options: UseSelectOptions<T>
): [ T | undefined, SelectProps ] {

  // ----
  // Internal Hooks
  // ----
  const selector = useDataSelector(list, {
    defaultSelected: options.defaultSelected,
    comparer       : useDataSelector.idComparer
  });

  const getOptionLabel = useSyncedRef(options.getOptionLabel);


  // ----
  // Handlers
  // ----
  const handleSelectValueChange = React.useCallback(
    (value: string | null) => {
      /** Get matching item from the list */
      const element = list.find(e => getElementId(e) === value);
      /** Update the selected item */
      selector.setSelected(element);
    },
    [ list, selector ]
  );


  // ----
  // Memoized Content
  // ----
  const selectableData = React.useMemo(
    (): SelectItem[] => (
      list.map((element) => ({
        label: getOptionLabel.current(element),
        value: getElementId(element)
      }))
    ),
    [ getOptionLabel, list ]
  );

  const selectedData = React.useMemo(
    (): SelectItem | undefined => (
      selector.selected != null
        ? selectableData.find(d => d.value === getElementId(selector.selected as T))
        : undefined
    ),
    [ selectableData, selector.selected ]
  );

  const selectProps = React.useMemo(
    (): SelectProps => ({
      data    : selectableData,
      onChange: handleSelectValueChange,
      value   : selectedData?.value
    }),
    [ handleSelectValueChange, selectableData, selectedData ]
  );


  // ----
  // Hook Return
  // ----
  return [ selector.selected, selectProps ];

}
