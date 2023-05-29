import * as React from 'react';

import type { AnyObject } from '@proedis/types';

import { Checkbox } from '@mantine/core';

import { useRxTable } from '../RxTable.context';


/* --------
 * Component Interfaces
 * -------- */
export interface SingleRowSelectorProps<Data extends AnyObject> {
  /** The row to select */
  row: Data;
}


/* --------
 * Component Definition
 * -------- */
const SingleRowSelector: React.FunctionComponent<SingleRowSelectorProps<AnyObject>> = (
  props
) => {

  /** Get the Row */
  const { row } = props;


  // ----
  // Get Context Props
  // ----
  const {
    selection: {
      isRowSelected,
      toggleSelectRow
    }
  } = useRxTable();


  // ----
  // Handlers
  // ----
  const handleCheckboxClick = React.useCallback<React.MouseEventHandler<HTMLInputElement>>(
    (event) => {
      event.stopPropagation();
    },
    []
  );

  const handleToggleRow = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    () => {
      toggleSelectRow(row);
    },
    [ toggleSelectRow, row ]
  );


  // ----
  // Checkbox Render as a Memoized Component
  // ----
  return React.useMemo(
    () => (
      <Checkbox
        display={'inline-block'}
        checked={isRowSelected(row)}
        onClick={handleCheckboxClick}
        onChange={handleToggleRow}
      />
    ),
    [ isRowSelected, handleToggleRow, row, handleCheckboxClick ]
  );
};

SingleRowSelector.displayName = 'SingleRowSelector';

export default SingleRowSelector;
