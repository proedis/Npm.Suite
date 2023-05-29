import * as React from 'react';

import type { AnyObject } from '@proedis/types';

import { useAutoSizer } from '../../hooks';

import { RxTableProvider } from './RxTable.context';
import type { RxTableContext } from './RxTable.context';

import type { RxTableProps } from './RxTable.types';

import { useRxTableFactory } from './RxTable.factory';

import Table from '../Table';

import RxTableHeaderWrapper from './components/RxTableHeaderWrapper';
import RxTableHeader from './components/RxTableHeader';
import RxTableHeaderRow from './components/RxTableHeaderRow';
import RxTableFilterRow from './components/RxTableFilterRow';

import RxTableBodyWrapper from './components/RxTableBodyWrapper';
import RxTableBody from './components/RxTableBody';
import RxTableBodyContent from './components/RxTableBodyContent';

import RxTableFooterWrapper from './components/RxTableFooterWrapper';
import RxTableFooter from './components/RxTableFooter';
import RxTableFooterRow from './components/RxTableFooterRow';

import { useVirtualizedStyle } from './RxTable.styles';


/* --------
 * Component Render
 * -------- */
const RxTable = <Data extends AnyObject>(
  props: RxTableProps<Data>
): React.FunctionComponentElement<RxTableProps<Data>> | null => {

  const {
    virtualize,

    classes: userDefinedClasses,
    columns,
    data,
    defaultReverseSorting: userDefinedDefaultReverseSorting,
    defaultSelectedData  : userDefinedSelectedData,
    defaultSort          : userDefinedDefaultSort,
    filterLogic,
    getRowKey: userDefinedGetRowKey,
    maxWidth,
    minWidth,
    noFilteredDataEmptyContentProps,
    noDataEmptyContentProps,
    onRowClick,
    onSortChange,
    onSelectedDataChange,
    reverseSorting: userDefinedReverseSorting,
    selectable,
    sort  : userDefinedSort,
    styles: userDefinedStyles,
    width : userDefinedWidth,

    filterRowHeight: userDefinedFilterRowHeight,
    footerRowHeight: userDefinedFooterRowHeight,
    headerRowHeight: userDefinedHeaderRowHeight,
    rowHeight      : userDefinedRowHeight,

    ...rest
  } = props;


  // ----
  // Initialize the Width Detector
  // ----
  const [ AutoSizer, { width, height } ] = useAutoSizer({
    parent     : '#yard-app-content',
    fixedWidth : userDefinedWidth,
    maxWidth,
    minWidth,
    useOwnWidth: true
  });


  // ----
  // Load RxTableProps
  // ----
  const rxTableProps = useRxTableFactory<Data>({
    classes              : userDefinedClasses,
    columns,
    data,
    defaultReverseSorting: userDefinedDefaultReverseSorting,
    defaultSelectedData  : userDefinedSelectedData,
    defaultSort          : userDefinedDefaultSort,
    filterLogic,
    virtualize,
    getRowKey            : userDefinedGetRowKey,
    onRowClick,
    onSelectedDataChange,
    onSortChange,
    reverseSorting       : userDefinedReverseSorting,
    selectable,
    sort                 : userDefinedSort,
    styles               : userDefinedStyles,
    width
  });


  // ----
  // Build Table Style
  // ----
  const {
    isVirtualized,
    getTableBodyHeight,
    tableDataHeight,
    headerRowHeight,
    filterRowHeight,
    footerRowHeight,
    rowHeight
  } = rxTableProps.layout;

  /** Get effective table height */
  const bodyHeight = getTableBodyHeight(height);
  const effectiveBodyHeight = Math.max(0, Math.min(bodyHeight, tableDataHeight));
  const effectiveTableHeight = effectiveBodyHeight + headerRowHeight + filterRowHeight + footerRowHeight;


  // ----
  // Virtualized RxTable Dedicated Style
  // ----
  const { classes, cx } = useVirtualizedStyle(
    {
      filterRowHeight,
      footerRowHeight,
      headerRowHeight,
      rowHeight,
      totalTableHeight: effectiveTableHeight
    },
    { name: 'RxVirtualizedTable' }
  );


  // ----
  // Context Building
  // ----
  const isShowingData = !!rxTableProps.tableData.length;
  const computedClasses = rxTableProps.classes || {};

  const rxTableContext: RxTableContext<Data> = {
    ...rxTableProps,
    noFilteredDataEmptyContentProps,
    noDataEmptyContentProps,
    classes: {
      ...rxTableProps.classes,
      Body         : cx(computedClasses.Body, isVirtualized && classes.section),
      BodyWrapper  : cx(computedClasses.BodyWrapper, isVirtualized && classes.section),
      BodyRow      : cx(
        computedClasses.BodyRow,
        isVirtualized && isShowingData && cx(classes.row, classes.rowHeight)
      ),
      BodyCell     : cx(
        computedClasses.BodyCell,
        isVirtualized && isShowingData && cx(classes.cell, classes.rowHeight)
      ),
      FilterRow    : cx(
        computedClasses.FilterRow || computedClasses.HeaderRow,
        isVirtualized && cx(classes.row, classes.filterHeight)
      ),
      FilterCell   : cx(
        computedClasses.FilterCell || computedClasses.HeaderCell,
        isVirtualized && cx(classes.cell, classes.filterHeight)
      ),
      Footer       : cx(computedClasses.Footer, isVirtualized && classes.section),
      FooterWrapper: cx(computedClasses.FooterWrapper, isVirtualized && classes.section),
      FooterCell   : cx(
        computedClasses.FooterCell,
        isVirtualized && cx(classes.cell, classes.footerHeight)
      ),
      FooterRow    : cx(
        computedClasses.FooterRow,
        isVirtualized && cx(classes.row, classes.footerHeight)
      ),
      Header       : cx(computedClasses.Header, isVirtualized && classes.section),
      HeaderWrapper: cx(computedClasses.HeaderWrapper, isVirtualized && cx(classes.section, classes.aboveContent)),
      HeaderRow    : cx(
        computedClasses.HeaderRow,
        isVirtualized && cx(classes.row, classes.headerHeight)
      ),
      HeaderCell   : cx(
        computedClasses.HeaderCell,
        isVirtualized && cx(classes.cell, classes.headerHeight)
      )
    }
  };


  // ----
  // Component Render
  // ----
  return (
    <RxTableProvider value={rxTableContext}>
      <AutoSizer>
        {!!height && !!width && (
          <Table
            layout={'fixed'}
            {...rest}
            component={isVirtualized ? 'div' : 'table'}
            className={cx(rest.className, isVirtualized && isShowingData && classes.root)}
          >

            {/* Table Header */}
            {(rxTableProps.layout.hasHeaderRow || rxTableProps.layout.hasFilterRow) && (
              <RxTableHeaderWrapper>
                <RxTableHeader>
                  {/* Header Row Render */}
                  {rxTableProps.layout.hasHeaderRow && <RxTableHeaderRow />}
                  {/* Filter Row Render */}
                  {rxTableProps.layout.hasFilterRow && <RxTableFilterRow />}
                </RxTableHeader>
              </RxTableHeaderWrapper>
            )}

            {/* Table Body */}
            <RxTableBodyWrapper>
              <RxTableBody>
                <RxTableBodyContent height={effectiveBodyHeight} />
              </RxTableBody>
            </RxTableBodyWrapper>

            {/* Table Footer */}
            {rxTableProps.layout.hasFooterRow && (
              <RxTableFooterWrapper>
                <RxTableFooter>
                  <RxTableFooterRow />
                </RxTableFooter>
              </RxTableFooterWrapper>
            )}
          </Table>
        )}
      </AutoSizer>
    </RxTableProvider>
  );
};

RxTable.displayName = 'RxTable';

export default RxTable;
