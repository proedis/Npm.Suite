import * as React from 'react';

import { useRxTable } from '../RxTable.context';

import Table from '../../Table';

import RxTableFooterCell from './RxTableFooterCell';


const RxTableFooterRow = React.forwardRef<HTMLTableRowElement>(
  (props, ref) => {

    const {
      classes,
      styles,
      columns,
      layout: {
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
        className={classes.FooterRow}
        style={styles.FooterRow}
      >
        {columns.current.map((column) => (
          <RxTableFooterCell
            key={column.key}
            column={column}
          />
        ))}
      </Table.Row>
    );

  }
);

RxTableFooterRow.displayName = 'RxTableFooterRow';

export default RxTableFooterRow;
