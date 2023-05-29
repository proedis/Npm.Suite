import * as React from 'react';

import { VariableSizeList } from 'react-window';
import type { ListItemKeySelector } from 'react-window';

import EmptyContent from '../../EmptyContent';

import { useRxTable } from '../RxTable.context';

import RxTableBodyRow from './RxTableBodyRow';

import Table from '../../Table';


/* --------
 * Internal Types
 * -------- */
interface RxTableBodyContentProps {
  /** The variable list height */
  height: number;
}


/* --------
 * Memoize Children Component
 * -------- */
const MemoizedBodyRow = React.memo(RxTableBodyRow);


/* --------
 * Inner Component
 * -------- */


/* --------
 * Component Definition
 * -------- */
const RxTableBodyContent: React.FunctionComponent<RxTableBodyContentProps> = (props) => {

  // ----
  // Props Deconstruct
  // ----
  const {
    height
  } = props;


  // ----
  // Internal Hooks
  // ----
  const {
    noDataEmptyContentProps,
    noFilteredDataEmptyContentProps,
    classes,
    styles,
    columns,
    data,
    tableData,
    layout   : {
      isVirtualized,
      effectiveTableWidth,
      rowHeight,
      variableSizeListProps
    },
    selection: { getRowKey }
  } = useRxTable();


  // ----
  // Utilities
  // ----
  const variableListKeySelector = React.useCallback<ListItemKeySelector>(
    (index) => {
      return getRowKey(tableData[index], index, tableData);
    },
    [ getRowKey, tableData ]
  );


  // ----
  // Render No-Content Row
  // ----
  if (!tableData.length) {
    return (
      <Table.Row component={isVirtualized ? 'div' : 'tr'} className={classes.BodyRow} style={styles.BodyRow}>
        <Table.Cell
          component={isVirtualized ? 'div' : 'td'}
          colSpan={columns.current.length}
          className={classes.BodyCell}
          style={styles.BodyCell}
          header={(
            <React.Fragment>
              {!data.length && (
                <EmptyContent
                  header={'No Data'}
                  content={'No data to show'}
                  {...noDataEmptyContentProps}
                />
              )}

              {!!data.length && !tableData.length && (
                <EmptyContent
                  header={'No Match'}
                  content={'No data to show for current filters'}
                  {...noFilteredDataEmptyContentProps}
                />
              )}
            </React.Fragment>
          )}
        />
      </Table.Row>
    );
  }


  // ----
  // All Data Render
  // ----
  if (!isVirtualized) {
    return (
      <React.Fragment>
        {tableData.map((row, index) => (
          <MemoizedBodyRow
            key={getRowKey(row, index, tableData)}
            index={index}
          />
        ))}
      </React.Fragment>
    );
  }

  return (
    <VariableSizeList
      {...variableSizeListProps}
      itemKey={variableListKeySelector}
      itemSize={() => rowHeight}
      height={height}
      itemCount={tableData.length}
      width={effectiveTableWidth}
    >
      {MemoizedBodyRow}
    </VariableSizeList>
  );

};

RxTableBodyContent.displayName = 'RxTableBodyContent';

export default RxTableBodyContent;
