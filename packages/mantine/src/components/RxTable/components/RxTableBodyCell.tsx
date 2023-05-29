import type * as React from 'react';

import { isNil } from '@proedis/utils';

import type { AnyObject } from '@proedis/types';

import type { RxTableColumn } from '../lib/useColumns';

import { createTableCell } from '../../Table';


/* --------
 * Internal Types
 * -------- */
interface RxTableBodyCellProps<Data extends AnyObject> {
  /** Component ClassName */
  className?: string;

  /** Current rendering Column */
  column: RxTableColumn<Data>;

  /** Boolean used to get/set if table is virtualized */
  isVirtualized: boolean;

  /** Override the default content */
  overrideContent?: React.ReactNode;

  /** Current rendering row */
  row: Data;

  /** Current rendering row index */
  rowIndex: number;

  /** User defined style */
  style?: React.CSSProperties;

  /** Only filtered data */
  tableData: Data[];
}


/* --------
 * Component Definition
 * -------- */
const RxTableBodyCell: React.FunctionComponent<RxTableBodyCellProps<any>> = (props) => {

  const {
    className,
    overrideContent,
    column,
    isVirtualized,
    tableData,
    rowIndex,
    row,
    style
  } = props;


  // ----
  // Component Render
  // ----
  return createTableCell(
    !isNil(overrideContent)
      ? { children: overrideContent }
      : typeof column.render === 'function'
        ? (column.render(row, rowIndex, tableData) || '')
        : ((column.render ?? row[column.key]) || ''),
    {
      autoGenerateKey: false,
      defaultProps   : {
        truncate: isVirtualized
      },
      overrideProps  : {
        align    : column.align,
        className,
        component: isVirtualized ? 'div' : 'td',
        style
      }
    }
  );

};

RxTableBodyCell.displayName = 'RxTableBodyCell';

export default RxTableBodyCell;
