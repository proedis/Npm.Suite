import * as React from 'react';

import type { AnyObject } from '@proedis/types';

import { useRxTable } from '../RxTable.context';

import type { RxTableColumn } from '../lib/useColumns';

import { createTableHeaderCell } from '../../Table';


/* --------
 * Internal Types
 * -------- */
interface RxTableFooterCellProps {
  /** Current rendering Column */
  column: RxTableColumn<AnyObject>;
}


/* --------
 * Component Definition
 * -------- */
const RxTableFooterCell: React.FunctionComponent<RxTableFooterCellProps> = (props) => {

  // ----
  // Props Deconstruct
  // ----
  const {
    column
  } = props;


  const {
    classes,
    styles,
    data,
    tableData,
    selection: { selectedData },
    columns  : { getWidth: getColumnWidth },
    layout   : {
      isVirtualized
    }
  } = useRxTable();


  // ----
  // Get Column Width
  // ----
  const columnWidth = React.useMemo(
    () => getColumnWidth(column.key),
    [ getColumnWidth, column.key ]
  );


  // ----
  // Component Render
  // ----
  return createTableHeaderCell(
    (typeof column.footer === 'function'
      ? column.footer(tableData, selectedData, data)
      : column.footer as any) ?? '',
    {
      autoGenerateKey: false,
      defaultProps   : {
        className: classes.FooterCell,
        style    : styles.FooterCell
      },
      overrideProps  : {
        align    : column.align,
        component: isVirtualized ? 'div' : 'th',
        style    : {
          flexBasis: columnWidth,
          width    : columnWidth,
          minWidth : columnWidth,
          maxWidth : columnWidth
        }
      }
    }
  );
};

RxTableFooterCell.displayName = 'RxTableFooterCell';

export default RxTableFooterCell;
