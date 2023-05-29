import * as React from 'react';

import { useRxTable } from '../RxTable.context';

import Table from '../../Table';

import RxTableBodyCell from './RxTableBodyCell';
import SingleRowSelector from '../atoms/SingleRowSelector';


/* --------
 * Internal Types
 * -------- */
interface RxTableBodyRowProps {
  /** The row index */
  index: number;

  /** Row Style */
  style?: React.CSSProperties;
}


/* --------
 * Component Definition
 * -------- */
const RxTableBodyRow = React.forwardRef<HTMLTableRowElement, RxTableBodyRowProps>(
  (props, ref) => {

    const {
      index,
      style
    } = props;


    const {
      classes,
      styles,
      columns,
      layout: {
        isVirtualized
      },
      tableData,
      interaction: {
        isRowClickEnabled,
        handleRowClick: superHandleRowClick
      },
      selection  : {
        enabled: isDataSelectable
      }
    } = useRxTable();


    // ----
    // Extract Data from Array
    // ----
    const row = tableData[index];


    // ----
    // Handlers
    // ----
    const handleRowClick = React.useCallback(
      () => {
        superHandleRowClick(index);
      },
      [ superHandleRowClick, index ]
    );


    // ----
    // Component Render
    // ----
    return (
      <Table.Row
        ref={ref}
        component={isVirtualized ? 'div' : 'tr'}
        className={classes.BodyRow}
        style={{
          ...styles.BodyRow,
          ...style
        }}
        onClick={isRowClickEnabled ? handleRowClick : undefined}
      >
        {columns.current.map((column, columnIndex) => {

          const columnWidth = columns.getWidth(column.key);

          return (
            <RxTableBodyCell
              key={column.key}
              className={classes.BodyCell}
              column={column}
              isVirtualized={isVirtualized}
              row={row}
              rowIndex={index}
              style={{
                ...styles.BodyRow,
                flexBasis: columnWidth,
                width    : columnWidth,
                minWidth : columnWidth,
                maxWidth : columnWidth
              }}
              tableData={tableData}
              overrideContent={(
                isDataSelectable && columnIndex === 0
                  ? <SingleRowSelector row={row} />
                  : undefined
              )}
            />
          );
        })}
      </Table.Row>
    );

  }
);

RxTableBodyRow.displayName = 'RxTableBodyRow';

export default RxTableBodyRow;
