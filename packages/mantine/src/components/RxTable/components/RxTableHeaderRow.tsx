import * as React from 'react';

import { useRxTable } from '../RxTable.context';

import Table from '../../Table';

import RxTableHeaderCell from './RxTableHeaderCell';

import AllRowsSelector from '../atoms/AllRowsSelector';


/* --------
 * Component Definition
 * -------- */
const RxTableHeaderRow = React.forwardRef<HTMLTableRowElement>(
  (props, ref) => {

    const {
      classes,
      styles,
      columns,
      selection: { enabled: isDataSelectable },
      layout   : {
        hasFilterRow,
        isVirtualized
      }
    } = useRxTable();


    // ----
    // Component Render
    // ----
    return (
      <Table.Row
        ref={ref}
        component={isVirtualized ? 'div' : 'tr'}
        className={classes.HeaderRow}
        style={styles.HeaderRow}
      >
        {columns.current.map((column, index) => (
          <RxTableHeaderCell
            key={column.key}
            column={column}
            isFilterHeaderCell={false}
            overrideContent={(
              isDataSelectable && index === 0
                ? !hasFilterRow ? <AllRowsSelector /> : ''
                : undefined
            )}
          />
        ))}
      </Table.Row>
    );

  }
);

RxTableHeaderRow.displayName = 'RxTableHeaderRow';

export default RxTableHeaderRow;
