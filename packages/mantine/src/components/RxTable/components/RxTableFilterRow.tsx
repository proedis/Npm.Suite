import * as React from 'react';

import { useRxTable } from '../RxTable.context';

import Table from '../../Table';

import RxTableHeaderCell from './RxTableHeaderCell';

import AllRowsSelector from '../atoms/AllRowsSelector';
import DataFilterElement from '../atoms/DataFilterElement';


/* --------
 * Component Definition
 * -------- */
const RxTableFilterRow = React.forwardRef<HTMLTableRowElement>(
  (props, ref) => {

    const {
      classes,
      styles,
      columns,
      selection: { enabled: isDataSelectable },
      layout   : { isVirtualized }
    } = useRxTable();


    // ----
    // Component Render
    // ----
    return (
      <Table.Row
        ref={ref}
        component={isVirtualized ? 'div' : 'tr'}
        className={classes.FilterRow}
        style={styles.FilterRow || styles.HeaderRow}
      >
        {columns.current.map((column, index) => (
          <RxTableHeaderCell
            isFilterHeaderCell
            key={column.key}
            column={column}
            overrideContent={(
              isDataSelectable && index === 0
                ? <AllRowsSelector />
                : (
                  <DataFilterElement
                    columnKey={column.key}
                    filter={column.filter}
                  />
                )
            )}
          />
        ))}
      </Table.Row>
    );

  }
);

RxTableFilterRow.displayName = 'RxTableFilterRow';

export default RxTableFilterRow;
