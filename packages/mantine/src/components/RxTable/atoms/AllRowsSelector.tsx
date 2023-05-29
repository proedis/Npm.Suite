import * as React from 'react';

import { Checkbox } from '@mantine/core';

import { useRxTable } from '../RxTable.context';


/* --------
 * Component Definition
 * -------- */
const AllRowsSelector: React.FunctionComponent = () => {

  // ----
  // Get data from Context
  // ----
  const {
    selection: {
      areAllRowsSelected,
      selectedCount,
      selectAllRows,
      deselectAllRows
    }
  } = useRxTable();


  // ----
  // Handle Select All Change
  // ----
  const handleSelectCheckboxChange = React.useCallback(
    () => {
      /** If all rows are selected, deselect */
      if (areAllRowsSelected) {
        deselectAllRows();
      }
      /** Else, select all rows */
      else {
        selectAllRows();
      }
    },
    [ areAllRowsSelected, deselectAllRows, selectAllRows ]
  );


  // ----
  // Return the Checkbox as Memoized Component
  // ----
  return React.useMemo(
    () => (
      <Checkbox
        display={'inline-block'}
        checked={selectedCount > 0}
        indeterminate={!areAllRowsSelected && selectedCount > 0}
        onChange={handleSelectCheckboxChange}
      />
    ),
    [ areAllRowsSelected, selectedCount, handleSelectCheckboxChange ]
  );
};

AllRowsSelector.displayName = 'AllRowsSelector';

export default AllRowsSelector;
