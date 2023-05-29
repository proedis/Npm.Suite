import * as React from 'react';

import type { AnyObject } from '@proedis/types';
import type { ShorthandItem } from '@proedis/react';

import type { Comparer } from '@proedis/utils';

import type { RxTableDataFilter } from './useDataFiltering';

import type { TableCellProps, TableHeaderCellProps } from '../../Table';


/* --------
 * Internal Types
 * -------- */
type SummaryCellRender<Data extends AnyObject, Props extends {}> =
  | ShorthandItem<Props>
  | ((filtered: Data[], selected: Data[], all: Data[]) => ShorthandItem<Props>);

type CellContentRender<Data extends AnyObject> =
  | ShorthandItem<TableCellProps>
  | ((row: Data, index: number, data: Data[]) => ShorthandItem<TableCellProps>);


/* --------
 * Columns Configuration
 * -------- */
interface RxTableStrictColumnsConfig<Data extends AnyObject> {
  /** Set the text align property, exposed to cell, header and footer cell */
  align?: TableCellProps['align'];

  /** User defined className, added to default to all cells of the columns */
  className?: string;

  /** Configure the input field to filter data */
  filter?: RxTableDataFilter<Data>;

  /** Columns footer property, used to display summary data */
  footer?: SummaryCellRender<Data, TableCellProps>;

  /** Columns header property */
  header?: SummaryCellRender<Data, TableHeaderCellProps>;

  /** Column key for iteration */
  key: string;

  /** Inner column cell render for each row */
  render?: CellContentRender<Data>;

  /** Sorting option configuration for column */
  sort?: Comparer<Data>[];
}

interface FixedWidthRxTableColumn {
  /** Set the fixed width for a column */
  width?: number;

  /** Set the width type, used to compute real column width, default to 'fixed' */
  widthType?: 'fixed' | 'percentage';
}

interface GrowingWidthRxTableColumn {
  /** The single Column grows-factor, same as flex-grow properties when using auto sizing */
  growFactor?: number;

  /** A column width 'auto' will take all possible space, related to other columns */
  width?: 'auto';
}


/* --------
 * Exporting Types
 * -------- */
export type RxTableColumn<Data extends AnyObject> =
  & RxTableStrictColumnsConfig<Data>
  & (FixedWidthRxTableColumn | GrowingWidthRxTableColumn);


export interface UseColumnsConfig<Data extends AnyObject> {
  /** Columns Array */
  columns: RxTableColumn<Data>[];

  /** Set if data will be selectable */
  selectable?: boolean;

  /** The entire table width */
  width: number;
}


export interface UseColumnsReturn<Data extends AnyObject> {
  /** Arranged Columns */
  columns: RxTableColumn<Data>[];

  /** Column width object */
  columnWidth: Record<string, number>;

  /** The effective table width */
  effectiveTableWidth: number;

  /** Get single column width */
  getWidth: (key: string) => number;

  /** The total columns width */
  totalColumnsWidth: number;
}


/* --------
 * Hook Definition
 * -------- */
export default function useColumns<Data extends AnyObject>(config: UseColumnsConfig<Data>): UseColumnsReturn<Data> {

  const {
    columns: userDefinedColumns,
    selectable,
    width: tableWidth
  } = config;


  // ----
  // Update Columns Field using Selectable
  // ----
  const columns: RxTableColumn<Data>[] = React.useMemo(
    () => {
      /** If table isn't selectable, return columns */
      if (!selectable) {
        return userDefinedColumns;
      }

      /** Return Columns width Select Column Props and Default */
      return [
        {
          key      : '%%selectable%%',
          width    : 58,
          textAlign: 'center'
        },
        ...userDefinedColumns
      ];
    },
    [ userDefinedColumns, selectable ]
  );


  // ----
  // Compute the effective Columns Width
  // ----
  const columnWidths: Record<string, number> = React.useMemo(
    () => {
      /** Build the Columns Container */
      const widths: Record<string, number> = {};

      /** Get the total used fixed space */
      const availableFlexibleSpace = tableWidth - columns
        .filter((column) => (
          typeof column.width === 'number' && (!column.widthType || column.widthType === 'fixed')
        ))
        .reduce<number>((total, next) => total + (next.width as number), 0);

      /** Get total available spacing for auto column */
      let autoFlexibleSpace = availableFlexibleSpace;

      /** Loop each column to build width */
      columns
        .filter((column) => typeof column.width === 'number')
        .forEach((column) => {
          /** Calc percentage space */
          if ('widthType' in column && column.widthType === 'percentage') {
            const columnWidth = Math.max(
              0,
              Math.round((availableFlexibleSpace / 100) * (column.width as number))
            );
            widths[column.key] = columnWidth;
            autoFlexibleSpace -= columnWidth;
            return;
          }

          /** Return the user defined width */
          widths[column.key] = Math.round(column.width as number);
        });

      const autoSizingColumns = columns.filter((column) => (
        column.width === 'auto' || column.width === undefined
      )) as (GrowingWidthRxTableColumn & RxTableStrictColumnsConfig<Data>)[];

      /** Get the maximum growing factor */
      const totalGrowFactor = autoSizingColumns.reduce<number>((max, { growFactor }) => (
        max + Math.max(1, (growFactor ?? 1))
      ), 0);

      /** Compute the Auto-Sizing Columns */
      autoSizingColumns
        .forEach((column) => {
          /** Divide the spacing equally */
          widths[column.key] = Math.round((autoFlexibleSpace / totalGrowFactor) * Math.max(
            1,
            (column.growFactor ?? 1)
          ));
        });

      return widths;
    },
    [ columns, tableWidth ]
  );


  // ----
  // Save the Total Columns Width
  // ----
  const totalColumnsWidth = React.useMemo(
    (): number => (
      Object
        .keys(columnWidths)
        .reduce<number>(((totalWidth, nextKey) => (totalWidth + columnWidths[nextKey])), 0)
    ),
    [ columnWidths ]
  );


  // ----
  // Save the max width using tableWidth and totalColumnsWidth
  // ----
  const effectiveTableWidth = Math.max(tableWidth, totalColumnsWidth);


  // ----
  // Build a function to retrieve the exact columnWidth
  // ----
  const lastColumnWidth = React.useMemo(
    () => {
      /** Get the last column key from columns array */
      const lastKey = columns[columns.length - 1].key;

      /** Compute all columns key, excluding last column */
      const restColumnsWidth = Object.keys(columnWidths).reduce<number>((totalWidth, nextKey) => (
        nextKey === lastKey
          ? totalWidth
          : totalWidth + (columnWidths[nextKey])
      ), 0);

      /** Return the effective table width, excluding all other columns width */
      return effectiveTableWidth - restColumnsWidth;
    },
    [ columnWidths, columns, effectiveTableWidth ]
  );

  const getColumnWidth = React.useCallback(
    (key: string) => {
      /** Check if is last column */
      const isLast = columns[columns.length - 1].key === key;

      /** Return effective column width for not last column */
      return isLast ? lastColumnWidth : columnWidths[key] ?? 0;
    },
    [ columnWidths, columns, lastColumnWidth ]
  );


  // ----
  // Return Tools
  // ----
  return {
    columns,
    columnWidth: columnWidths,
    effectiveTableWidth,
    totalColumnsWidth,
    getWidth   : getColumnWidth
  };
}
