import * as React from 'react';

import { isNil } from '@proedis/utils';

import type { AnyObject } from '@proedis/types';

import { useRxTable } from '../RxTable.context';

import type { RxTableColumn } from '../lib/useColumns';

import { createTableHeaderCell } from '../../Table';


/* --------
 * Internal Types
 * -------- */
interface RxTableHeaderCellProps {
  /** Current rendering Column */
  column: RxTableColumn<AnyObject>;

  /** Set/Check if the current Cell is in FilterRow component */
  isFilterHeaderCell: boolean;

  /** Override the default content */
  overrideContent?: React.ReactNode;
}


/* --------
 * Component Definition
 * -------- */
const RxTableHeaderCell: React.FunctionComponent<RxTableHeaderCellProps> = (props) => {

  // ----
  // Props Deconstruct
  // ----
  const {
    overrideContent,
    column,
    isFilterHeaderCell
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
    },
    sorting  : {
      current   : currentSorting,
      set       : setSorting,
      isReversed: isSortReversed
    }
  } = useRxTable();


  // ----
  // Get Column Sort Property
  // ----
  const columnSort = React.useMemo(
    (): { isSortable: boolean, isSorted: boolean } => {
      const isSortable = Array.isArray(column.sort) && !!column.sort.length && !isFilterHeaderCell;

      return {
        isSortable,
        isSorted: isSortable && currentSorting === column.sort
      };
    },
    [ column.sort, currentSorting, isFilterHeaderCell ]
  );


  // ----
  // Handlers
  // ----
  const handleSortChange = React.useCallback(
    () => {
      if (!columnSort.isSortable) {
        return;
      }

      if (columnSort.isSorted) {
        setSorting(column.sort!, !isSortReversed);
      }
      else {
        setSorting(column.sort!, false);
      }
    },
    [
      column.sort,
      isSortReversed,
      setSorting,
      columnSort.isSortable,
      columnSort.isSorted
    ]
  );


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
    !isNil(overrideContent)
      ? { children: overrideContent }
      : typeof column.header === 'function'
        ? column.header(tableData, selectedData, data)
        : (column.header as any || ''),
    {
      autoGenerateKey: false,
      defaultProps   : {
        className: isFilterHeaderCell ? (classes.FilterCell || classes.HeaderCell) : classes.HeaderCell,
        style    : isFilterHeaderCell ? (styles.FilterCell || styles.HeaderCell) : styles.HeaderCell
      },
      overrideProps  : {
        align    : column.align,
        component: isVirtualized ? 'div' : 'th',
        sortable : columnSort.isSortable,
        sorted   : columnSort.isSorted ? (isSortReversed ? 'desc' : 'asc') : undefined,
        onClick  : columnSort.isSortable ? handleSortChange : undefined,
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

RxTableHeaderCell.displayName = 'RxTableHeaderCell';

export default RxTableHeaderCell;
