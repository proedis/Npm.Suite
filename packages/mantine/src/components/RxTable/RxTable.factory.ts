import * as React from 'react';

import type { VariableSizeListProps } from 'react-window';

import type { Comparer } from '@proedis/utils';
import type { AnyObject } from '@proedis/types';

import useColumns from './lib/useColumns';
import type { UseColumnsConfig, RxTableColumn } from './lib/useColumns';

import useDataFiltering from './lib/useDataFiltering';
import type { UseDataFiltering } from './lib/useDataFiltering';

import useDataSelector from './lib/useDataSelector';
import type { DataSelector, UseDataSelectorConfig } from './lib/useDataSelector';

import useDataSorting from './lib/useDataSorting';
import type { UseDataSortingConfig } from './lib/useDataSorting';
import { isNil } from '@proedis/utils';


/* --------
 * Internal Types
 * -------- */
type RxTableComponent =
  | 'HeaderWrapper'
  | 'Header'
  | 'HeaderRow'
  | 'HeaderCell'
  | 'FilterRow'
  | 'FilterCell'
  | 'BodyWrapper'
  | 'Body'
  | 'BodyRow'
  | 'BodyCell'
  | 'FooterWrapper'
  | 'Footer'
  | 'FooterRow'
  | 'FooterCell';

type RxTableComponentClasses = Partial<Record<RxTableComponent, string>>;
type RxTableComponentStyles = Partial<Record<RxTableComponent, React.CSSProperties>>;

interface RxTableElementsHeight {
  /** Filter row height */
  filterRowHeight?: number;

  /** Footer row height */
  footerRowHeight?: number;

  /** Header row height */
  headerRowHeight?: number;

  /** Single row height */
  rowHeight?: number;
}


/* --------
 * Virtualization Kept Props
 * -------- */
type KeepVariableSizeListProp =
  | 'direction'
  | 'overscanCount'
  | 'onItemsRendered'
  | 'onScroll'
  | 'useIsScrolling';


/* --------
 * Table Factory Configuration
 * -------- */
export type UseRxTableFactoryConfig<Data extends AnyObject> =
  & UseColumnsConfig<Data>
  & UseDataFiltering<Data>
  & UseDataSelectorConfig<Data>
  & UseDataSortingConfig<Data>
  & { data: Data[] }
  & { onRowClick?: (row: Data, index: number, array: Data[]) => void; }
  & { classes?: RxTableComponentClasses }
  & { styles?: RxTableComponentStyles }
  & { virtualize?: boolean | Partial<Pick<VariableSizeListProps, KeepVariableSizeListProp>> }
  & Partial<RxTableElementsHeight>;


/* --------
 * Table Factory Tools
 * -------- */
export interface RxTableFactory<Data extends AnyObject> {
  /** User defined classes */
  classes: RxTableComponentClasses;

  /** All loaded data */
  data: Data[];

  /** Only filtered and sorted data */
  tableData: Data[];

  /** Columns Descriptor */
  columns: {
    /** Current table columns */
    current: RxTableColumn<Data>[];
    /** Get column width by key */
    getWidth: (key: string) => number;
    /** The width of the columns indexed by key */
    width: Record<string, number>;
  };

  /** Data filters */
  filter: {
    /** Current filters */
    current: Record<string, any>;
    /** Set column filter by key */
    set: (column: string, value: any) => void;
  };

  /** Interaction handler */
  interaction: {
    /** Check if row click is enabled */
    isRowClickEnabled: boolean;
    /** Row Click Handler */
    handleRowClick: (index: number) => void;
  },

  /** Table Layout Props */
  layout: {
    /** Filter row height */
    filterRowHeight: number;
    /** Footer row height */
    footerRowHeight: number;
    /** Header row height */
    headerRowHeight: number;
    /** Single row height */
    rowHeight: number;
    /** The effective table width */
    effectiveTableWidth: number;
    /** Utility function to get table body height */
    getTableBodyHeight: (height: number) => number;
    /** The Table has filter row */
    hasFilterRow: boolean;
    /** The Table has the Footer Row */
    hasFooterRow: boolean;
    /** The Table has header row */
    hasHeaderRow: boolean;
    /** Check if the table is virtualized */
    isVirtualized: boolean;
    /** Set of partial user-defined VariableSizeList Props */
    variableSizeListProps: Partial<VariableSizeListProps>;
    /** Total table data height, using rowHeight */
    tableDataHeight: number;
    /** The total columns width */
    totalColumnsWidth: number;
  };

  /** Data selection */
  selection: DataSelector<Data> & { enabled: boolean };

  /** Sort controller */
  sorting: {
    /** Current sorting */
    current: Comparer<Data>[];
    /** Check if is reversed */
    isReversed: boolean;
    /** Set new sorting */
    set: (fields: Comparer<Data>[], reverse: boolean) => void;
  };

  /** User defined styles */
  styles: RxTableComponentStyles;
}


/* --------
 * Hook Definition
 * -------- */
export function useRxTableFactory<Data extends AnyObject>(
  config: UseRxTableFactoryConfig<Data>
): RxTableFactory<Data> {


  // ----
  // Code Destructuring
  // ----
  const {
    classes,
    columns: userDefinedColumns,
    data,
    defaultReverseSorting: userDefinedDefaultReverseSorting,
    defaultSelectedData  : userDefinedDefaultSelectedData,
    defaultSort          : userDefinedDefaultSort,
    filterLogic,
    getRowKey: userDefinedGetRowKey,
    onRowClick,
    onSelectedDataChange,
    onSortChange,
    reverseSorting: userDefinedReverseSorting,
    selectable,
    sort: userDefinedSort,
    styles,

    width,
    filterRowHeight: userDefinedFilterRowHeight,
    footerRowHeight: userDefinedFooterRowHeight,
    headerRowHeight: userDefinedHeaderRowHeight,
    rowHeight      : userDefinedRowHeight,

    virtualize
  } = config;


  // ----
  // Checker Builder
  // ----
  const hasFilterRow = React.useMemo<boolean>(
    () => userDefinedColumns.some((column) => !!column.filter),
    [ userDefinedColumns ]
  );

  const hasFooterRow = React.useMemo<boolean>(
    () => userDefinedColumns.some((column) => !!column.footer),
    [ userDefinedColumns ]
  );

  const hasHeaderRow = React.useMemo<boolean>(
    () => userDefinedColumns.some((column) => !!column.header),
    [ userDefinedColumns ]
  );


  // ----
  // Compute effective column and table widths
  // ----
  const {
    columns,
    columnWidth,
    effectiveTableWidth,
    getWidth,
    totalColumnsWidth
  } = useColumns({
    columns: userDefinedColumns,
    selectable,
    width
  });


  // ----
  // Data Filtering
  // ----
  const {
    filteredData,
    filters,
    setFilter
  } = useDataFiltering(hasFilterRow, {
    columns,
    data,
    filterLogic
  });


  // ----
  // Enable Data Selector Hook
  // ----
  const dataSelector = useDataSelector({
    allData            : data,
    filteredData,
    selectable,
    defaultSelectedData: userDefinedDefaultSelectedData,
    getRowKey          : userDefinedGetRowKey,
    onSelectedDataChange
  });


  // ----
  // Sorting Controller
  // ----
  const {
    isSortReversed,
    setSorting,
    sorting,
    sortedData
  } = useDataSorting({
    columns,
    data                 : filteredData,
    defaultReverseSorting: userDefinedDefaultReverseSorting,
    defaultSort          : userDefinedDefaultSort,
    onSortChange,
    reverseSorting       : userDefinedReverseSorting,
    sort                 : userDefinedSort
  });


  // ----
  // Internal Handlers
  // ----
  const handleRowClick = React.useCallback(
    (index: number) => {
      if (onRowClick) {
        onRowClick(sortedData[index], index, sortedData);
      }
    },
    [ onRowClick, sortedData ]
  );


  // ----
  // Elements Height Compute
  // ----
  const rowHeight = userDefinedRowHeight ?? 56;

  const headerRowHeight = !hasHeaderRow ? 0
    : typeof userDefinedHeaderRowHeight === 'number' ? userDefinedHeaderRowHeight
      : 48;

  const filterRowHeight = !hasFilterRow ? 0
    : Math.max(62, typeof userDefinedFilterRowHeight === 'number' ? userDefinedFilterRowHeight : headerRowHeight);

  const footerRowHeight = !hasFooterRow ? 0
    : typeof userDefinedFooterRowHeight === 'number' ? userDefinedFooterRowHeight
      : headerRowHeight;

  const tableDataHeight = sortedData.length * rowHeight;

  const getTableBodyHeight = React.useCallback(
    (height: number) => (
      height - headerRowHeight - filterRowHeight - footerRowHeight
    ),
    [ filterRowHeight, footerRowHeight, headerRowHeight ]
  );


  // ----
  // Build Factory and Return
  // ----
  return {

    data,

    tableData: sortedData,

    classes: classes ?? {},

    columns: {
      current: columns,
      getWidth,
      width  : columnWidth
    },

    filter: {
      current: filters,
      set    : setFilter
    },

    interaction: {
      isRowClickEnabled: typeof onRowClick === 'function',
      handleRowClick
    },

    layout: {
      effectiveTableWidth,
      filterRowHeight,
      footerRowHeight,
      getTableBodyHeight,
      hasFilterRow,
      hasFooterRow,
      hasHeaderRow,
      headerRowHeight,
      isVirtualized        : !!virtualize,
      rowHeight,
      variableSizeListProps: typeof virtualize === 'object' && !isNil(virtualize) ? virtualize : {},
      tableDataHeight,
      totalColumnsWidth
    },

    selection: {
      ...dataSelector,
      enabled: !!selectable
    },

    sorting: {
      current   : sorting,
      isReversed: isSortReversed,
      set       : setSorting
    },

    styles: styles ?? {}

  };
}
