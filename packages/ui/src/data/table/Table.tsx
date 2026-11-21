'use client';

import * as React from 'react';

import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';
import {
  columnVisibilityFeature,
  createColumnHelper,
  createPaginatedRowModel,
  createSortedRowModel,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric as sortAlphanumeric,
  sortFn_basic as sortBasic,
  sortFn_text as sortText,
  tableFeatures,
  useTable
} from '@tanstack/react-table';

import { useAnnouncer, useDelayedBusy } from '@proedis/react';

import { splitBaseProps } from '../../core/base';
import { cn } from '../../core/cn';

import { Stack } from '../../layout/Stack';

import { LoadingBar } from '../../primitives/LoadingBar';

import { Button } from '../../actions/button/Button';
import { IconButton } from '../../actions/button/IconButton';
import { Menu } from '../../actions/menu/Menu';
import { SharedMenu, SharedMenuTrigger, createSharedMenuHandle } from '../../actions/menu/SharedMenu';
import { Tooltip } from '../../actions/tooltip/Tooltip';

import { EmptyState } from '../../feedback/empty-state/EmptyState';

import { Checkbox } from '../../forms/checkbox/Checkbox';

import {
  ACTIONS_COLUMN_STEPS,
  ALIGN_CLASS,
  COLUMN_STEPS,
  CellContent,
  SELECT_COLUMN_STEPS,
  cellText,
  columnAlign,
  readCellValue,
  sortValue
} from './tableCells';
import { TableColumnsButton } from './TableColumnsButton';
import { useTableFormats } from './tableFormats';
import { TableGlyph } from './tableGlyphs';
import { TablePagination } from './TablePagination';
import { CELL, ColumnGroup, HEAD, PIN_START, ROW, SkeletonRows, TruncationTooltip, markScroll } from './tableParts';
import { TableSelectionBar, selectionMenuItems } from './TableSelectionBar';
import {
  EMPTY_SELECTION,
  defaultVisibility,
  firstSortDesc,
  initialViewState,
  isColumnVisible,
  isRowSelected,
  lastPageIndex,
  nextSorting,
  pageSelectionState,
  rowsBetween,
  selectionCount,
  setRowsSelected,
  withoutHidden
} from './tableState';
import { useTableGrid } from './useTableGrid';

import type { BaseProps } from '../../core/base';

import type { MenuAnchor } from '../../actions/menu/menuPanel';

import type {
  TableColumn,
  TableEmpty,
  TableLabels,
  TableRowActions,
  TableSelection,
  TableSelectionAction,
  TableSort,
  TableStateChange,
  TableStatus,
  TableViewState
} from './tableTypes';


/* --------
 * Types Definition
 * -------- */

export interface StrictTableProps<TData extends object> extends BaseProps {
  /** The name of the list for screen readers. Required */
  caption: string;

  /** The columns, in order, each with its kind */
  columns: readonly TableColumn<TData>[];

  /** The current page (`server`) or every row (`client`). Keep it stable between meaningful changes */
  data: readonly TData[];

  /** `server` pages and sorts on the server; `client` in memory, for lists under ~100 rows. Defaults to `server` */
  mode?: 'server' | 'client';

  /** The total of the result. Required with `server` */
  rowCount?: number;

  /** The id the selection keeps. Required */
  getRowId: (row: TData) => string;

  /**
   * The parts of the view the page holds: the ones passed are controlled, the others the table keeps.
   * Every change, of either kind, comes out of `onStateChange`, whole and in one call: a new order
   * already brings page 1, so the address is written once.
   */
  state?: Partial<TableViewState>;
  defaultState?: Partial<TableViewState>;
  onStateChange?: (state: TableViewState, change: TableStateChange) => void;

  /** The order the third click goes back to. The order is never empty */
  defaultSorting?: readonly TableSort[];

  /** 25, 50, 100 by default; the default size is 50 when offered */
  pageSizeOptions?: readonly number[];

  /** The row above, on the left: the FiltersBar */
  toolbar?: React.ReactNode;

  /** The signature of filters and search: when it changes, page 1 and an empty selection */
  filterKey?: string;

  /** Whether the search has text: the empty table offers "Clear filters and search" instead of "Clear filters" */
  searchActive?: boolean;

  /** Clears filters and search from the empty table */
  onClearFilters?: () => void;

  /** The actions of the selection bar. Without, no checkboxes */
  selectionActions?: readonly TableSelectionAction[];

  /** Up to two of them as buttons in the bar */
  inlineSelectionActions?: readonly string[];

  /** Controlled or kept by the table, like the view */
  selection?: TableSelection;
  defaultSelection?: TableSelection;
  onSelectionChange?: (selection: TableSelection) => void;

  /** `true`, or the reason a row cannot be chosen: its checkbox is read only, with the reason in the tooltip */
  enableRowSelection?: (row: TData) => true | string;

  /** The ⋯ of each row, as data. `null` for a row without actions: no ⋯, and the browser's own right click menu */
  rowActions?: (row: TData) => TableRowActions | null;

  /** `fetching` only when the request changes; a refresh in the background does not show */
  status?: TableStatus;

  /** With `status="error"`: whether to offer "Retry" or, for a request refused, the invalid view */
  error?: { retryable: boolean };
  onRetry?: () => void;

  /** The empty table at first use */
  empty?: TableEmpty;

  /** Back from a detail: the row whose code takes the focus, scrolled into view */
  focusRowId?: string;

  labels: TableLabels<TData>;
  className?: string;
}

/** The native props of a `<div>` reach the root, around the toolbar, the grid and the pagination */
export type TableProps<TData extends object> = StrictTableProps<TData> & Omit<
  React.ComponentProps<'div'>,
  keyof StrictTableProps<TData> | 'ref' | 'children'
>;

type MenuPayload = { scope: 'row'; id: string } | { scope: 'selection'; id: string };


/* --------
 * Constants Definition
 * -------- */

const DEFAULT_PAGE_SIZES = [ 25, 50, 100 ] as const;

const SKELETON_ROWS = 8;

const FEATURES = tableFeatures({
  columnVisibilityFeature,
  rowSortingFeature,
  sortedRowModel  : createSortedRowModel(),
  sortFns         : { alphanumeric: sortAlphanumeric, text: sortText, basic: sortBasic },
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel()
});

type EngineRow = Record<string, unknown>;

const columnHelper = createColumnHelper<typeof FEATURES, EngineRow>();

/* --------
 * Helpers
 * -------- */

/** The point of a right click, as the anchor of the menu */
function pointAnchor(x: number, y: number): MenuAnchor {
  return { getBoundingClientRect: () => DOMRect.fromRect({ x, y, width: 0, height: 0 }) };
}

function SortArrow(props: { direction: false | 'asc' | 'desc' }): React.ReactNode {
  const { direction } = props;

  if (direction === false) {
    return <TableGlyph name={'arrowsUpDown'} className={'size-3.5 invisible group-hover/sort:visible group-focus-visible/sort:visible'} />;
  }

  return <TableGlyph name={direction === 'asc' ? 'arrowUp' : 'arrowDown'} className={'size-3.5'} />;
}


/* --------
 * Component Definition
 * -------- */

/**
 * The table of every list: the page declares columns, rows and state, the table draws cells, order,
 * pages, selection and states. Above it the row of filters, below it the footer with the pages.
 *
 * ```tsx
 * <Table
 *   caption={t('SIGNALS.LIST')}
 *   columns={signalColumns}
 *   data={page.rows}
 *   rowCount={page.total}
 *   getRowId={(signal) => signal.id}
 *   state={view}
 *   onStateChange={setView}
 *   defaultSorting={[ { id: 'openedAt', desc: true } ]}
 *   status={status}
 *   toolbar={<FiltersBar … />}
 *   rowActions={(signal) => ({ actions: signalActions(signal), inline: [ 'preview', 'edit' ] })}
 *   labels={tableLabels}
 * />
 * ```
 *
 * On TanStack Table, headless: the engine keeps the visible columns and, in a client table, sorts and
 * pages in memory; the markup, the keys and the selection are ours. The selection is outside the engine
 * because the engine can only choose the rows it has loaded, and "every row of the filter" is a state
 * of its own.
 *
 * A real HTML table with the role of a grid: one stop in the Tab order, arrows inside. Sorting on up to
 * two columns (Shift adds the second), never empty. Pinned checkbox and code when the table scrolls
 * sideways, with shades on the side where there is more. A right click on a row opens the menu
 * of its ⋯, Shift F10 too; on a chosen row the menu of the selection.
 *
 * Parts with a slot: `table` (with `data-mode`, `data-status`), `table-toolbar`, `table-toolbar-content`,
 * `table-count`, `table-card`, `table-scroller`, `table-grid`, `table-head`, `table-header-cell` (with
 * `data-kind`), `table-sort`, `table-select-all`, `table-actions-header`, `table-body`, `table-row` (with
 * `data-selected`), `table-select-cell`, `table-select-blocked`, `table-cell` (with `data-kind`),
 * `table-row-actions` (with `data-empty` when the row has none), `table-row-actions-buttons`,
 * `table-skeleton-row`, `table-state`, `table-selection-bar`, `table-columns`, `table-pagination`.
 */
export function Table<TData extends object>(props: TableProps<TData>): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    caption,
    className,
    columns,
    data,
    defaultSelection,
    defaultSorting = [],
    defaultState,
    empty,
    enableRowSelection,
    error,
    filterKey = '',
    focusRowId,
    getRowId,
    inlineSelectionActions = [],
    labels,
    mode = 'server',
    onClearFilters,
    onRetry,
    onSelectionChange,
    onStateChange,
    pageSizeOptions = DEFAULT_PAGE_SIZES,
    rowActions,
    rowCount: rowCountProp,
    searchActive = false,
    selection: selectionProp,
    selectionActions = [],
    state: stateProp,
    status = 'ready',
    toolbar,
    ...others
  } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Internal Hooks
  // ----
  const formats = useTableFormats();
  const baseId = React.useId();
  const fetching = useDelayedBusy(status === 'fetching').visible;


  // ----
  // Internal State
  // ----
  const defaultPageSize = pageSizeOptions.includes(50) ? 50 : pageSizeOptions[0] ?? 50;

  const [ ownView, setOwnView ] = React.useState<TableViewState>(() => ({
    ...initialViewState(columns, defaultSorting, defaultPageSize),
    ...defaultState
  }));

  const [ ownSelection, setOwnSelection ] = React.useState<TableSelection>(defaultSelection ?? EMPTY_SELECTION);
  const [ menuTarget, setMenuTarget ] = React.useState<{ payload: MenuPayload; anchor?: MenuAnchor } | null>(null);
  const [ announcement, announce ] = useAnnouncer();

  const anchorRowRef = React.useRef<string | null>(null);
  const gridRef = React.useRef<HTMLTableElement>(null);
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const filterKeyRef = React.useRef(filterKey);

  /** The page and the selection of the last commit: what a change of filters has to report as reset */
  const committedRef = React.useRef<{ pageIndex: number; selection: TableSelection; rowCount: number }>({
    pageIndex: 0,
    selection: EMPTY_SELECTION,
    rowCount : 0
  });
  const focusedRowRef = React.useRef<string | undefined>(undefined);

  const [ menuHandle ] = React.useState(() => createSharedMenuHandle<MenuPayload>());
  const [ tooltipHandle ] = React.useState(() => TooltipPrimitive.createHandle<string>());

  const server = mode === 'server';
  const rowCount = server ? rowCountProp ?? data.length : data.length;
  const settled = status === 'ready' || status === 'fetching';
  const selectable = selectionActions.length > 0;

  /* New filters or search: page 1 and nothing chosen. Adjusted while rendering, told to the page after */
  const [ seenFilterKey, setSeenFilterKey ] = React.useState(filterKey);

  if (seenFilterKey !== filterKey) {
    setSeenFilterKey(filterKey);
    setOwnView((current) => ({ ...current, pageIndex: 0 }));
    setOwnSelection(EMPTY_SELECTION);
  }

  const asked = React.useMemo<TableViewState>(() => ({ ...ownView, ...stateProp }), [ ownView, stateProp ]);
  const lastPage = lastPageIndex(rowCount, asked.pageSize);

  /* The rows dropped and the page asked for is not there any more: the last one that is */
  const view = React.useMemo<TableViewState>(
    () => (settled && asked.pageIndex > lastPage ? { ...asked, pageIndex: lastPage } : asked),
    [ asked, lastPage, settled ]
  );

  /*
   * "Every row" taken back down to none is no selection. Only once the rows are settled: while they
   * load the count is 0, and a page that keeps "every row" in its address lost it on every load.
   */
  const keptSelection = selectionProp ?? ownSelection;
  const selection = settled && keptSelection.all && selectionCount(keptSelection, rowCount) === 0
    ? EMPTY_SELECTION
    : keptSelection;


  // ----
  // Memoized Data
  // ----
  const columnById = React.useMemo(() => new Map(columns.map((column) => [ column.id, column ])), [ columns ]);

  const engineColumns = React.useMemo(
    () => columnHelper.columns(columns.map((column) => columnHelper.accessor(
      (row: EngineRow) => sortValue(column, row as unknown as TData),
      {
        id           : column.id,
        enableSorting: column.sortable === true,
        enableHiding : column.kind !== 'code' && column.hideable !== false,
        sortDescFirst: firstSortDesc(column),
        sortUndefined: 'last',
        sortFn       : column.kind === 'code' ? 'alphanumeric' : ([ 'text', 'reference', 'person' ].includes(column.kind) ? 'text' : 'basic')
      }
    ))),
    [ columns ]
  );

  const visibility = React.useMemo(
    () => ({ ...defaultVisibility(columns), ...view.columnVisibility }),
    [ columns, view.columnVisibility ]
  );


  // ----
  // Engine
  // ----

  const table = useTable({
    features           : FEATURES,
    columns            : engineColumns,
    data               : data as unknown as EngineRow[],
    getRowId           : (row: EngineRow) => getRowId(row as unknown as TData),
    state              : {
      sorting         : [ ...view.sorting ],
      pagination      : { pageIndex: view.pageIndex, pageSize: view.pageSize },
      columnVisibility: visibility
    },
    onSortingChange         : () => undefined,
    onPaginationChange      : () => undefined,
    onColumnVisibilityChange: () => undefined,
    manualSorting           : server,
    manualPagination        : server,
    rowCount,
    autoResetPageIndex      : false
  });

  const { rows } = table.getRowModel();
  const visibleColumns = table.getVisibleLeafColumns()
    .map((engineColumn) => columnById.get(engineColumn.id))
    .filter((column): column is TableColumn<TData> => column !== undefined);

  const rowById = new Map(rows.map((row) => [ row.id, row.original as unknown as TData ]));
  const pageIds = rows.map((row) => row.id);
  const canChoose = (id: string): boolean => {
    const row = rowById.get(id);

    return row !== undefined && (enableRowSelection?.(row) ?? true) === true;
  };
  const choosablePageIds = pageIds.filter(canChoose);


  // ----
  // State Changes
  // ----
  const commit = React.useCallback((next: TableViewState, change: TableStateChange): void => {
    setOwnView(next);
    onStateChange?.(next, change);
  }, [ onStateChange ]);

  const setSelection = React.useCallback((next: TableSelection): void => {
    setOwnSelection(next);
    onSelectionChange?.(next);
  }, [ onSelectionChange ]);

  const sortBy = (column: TableColumn<TData>, multi: boolean): void => {
    const sorting = nextSorting(view.sorting, column.id, firstSortDesc(column), multi, defaultSorting);

    commit({ ...view, sorting, pageIndex: 0 }, 'sorting');
    announce(sorting
      .map((sort) => labels.sortedBy(columnById.get(sort.id)?.header ?? sort.id, sort.desc ? 'desc' : 'asc'))
      .join('. '));
  };

  const setVisibility = (next: Record<string, boolean>): void => {
    const sorting = withoutHidden(view.sorting, (id) => {
      const column = columnById.get(id);

      return column ? isColumnVisible(column, next) : true;
    }, defaultSorting);

    commit({ ...view, columnVisibility: next, sorting, pageIndex: sorting === view.sorting ? view.pageIndex : 0 }, 'columnVisibility');
  };

  const toggleRow = (id: string, range: boolean): void => {
    if (!canChoose(id)) {
      return;
    }

    const value = !isRowSelected(selection, id);
    const anchor = anchorRowRef.current;
    const ids = range && anchor ? rowsBetween(pageIds, anchor, id).filter(canChoose) : [ id ];

    anchorRowRef.current = id;
    setSelection(setRowsSelected(selection, ids, value));
  };

  const togglePage = (): void => {
    const all = pageSelectionState(selection, choosablePageIds) === 'all';

    setSelection(setRowsSelected(selection, choosablePageIds, !all));
  };

  const clearSelection = (): void => {
    setSelection(EMPTY_SELECTION);
    scrollerRef.current?.querySelector<HTMLElement>('thead [role="checkbox"]')?.focus();
  };

  const openRowMenu = (id: string, payload: MenuPayload, anchor?: MenuAnchor): void => {
    setMenuTarget({ payload, anchor });
    menuHandle.open(`${baseId}-menu-${id}`);
  };


  // ----
  // Grid
  // ----
  const grid = useTableGrid(gridRef, {
    onSpace: selectable
      ? (row, shift) => {
        if (row.dataset.rowId) {
          toggleRow(row.dataset.rowId, shift);
        }
      }
      : undefined,
    onRowMenu: (row) => {
      const id = row.dataset.rowId;
      const original = id ? rowById.get(id) : undefined;

      if (id && original && (rowActions?.(original)?.actions.length ?? 0) > 0) {
        openRowMenu(id, { scope: 'row', id });
      }
    }
  });

  const handleContextMenu = (event: React.MouseEvent<HTMLTableSectionElement>): void => {
    const target = event.target as Element;

    /* On links, fields and selected text the browser's own menu stays */
    if (target.closest('a[href], input, textarea, select, [contenteditable="true"]') || (window.getSelection()?.toString() ?? '') !== '') {
      return;
    }

    const id = target.closest<HTMLElement>('tr[data-row-id]')?.dataset.rowId;
    const original = id ? rowById.get(id) : undefined;

    if (!id || !original || (rowActions?.(original)?.actions.length ?? 0) === 0) {
      return;
    }

    event.preventDefault();

    const onSelection = selectable && isRowSelected(selection, id);

    openRowMenu(id, onSelection ? { scope: 'selection', id } : { scope: 'row', id }, pointAnchor(event.clientX, event.clientY));
  };

  const handleScroll = (): void => {
    if (scrollerRef.current) {
      markScroll(scrollerRef.current);
    }
  };


  // ----
  // Lifecycle Events
  // ----

  /**
   * The page hears of what the table adjusted on its own.
   *
   * What was reset is read from the **previous commit**, not from this one: uncontrolled, the reset
   * already happened while rendering, so this commit's page is 0 and its selection empty, and a check
   * against them would never report anything. The previous values are written by the effect below,
   * which runs after this one.
   */
  React.useEffect(
    () => {
      if (filterKeyRef.current === filterKey) {
        return;
      }

      const before = committedRef.current;

      filterKeyRef.current = filterKey;
      anchorRowRef.current = null;

      if (before.pageIndex !== 0) {
        onStateChange?.({ ...asked, pageIndex: 0 }, 'filters');
      }

      if (selectionCount(before.selection, before.rowCount) > 0) {
        onSelectionChange?.(EMPTY_SELECTION);
      }
    },
    [ asked, filterKey, onSelectionChange, onStateChange ]
  );

  React.useEffect(() => {
    committedRef.current = { pageIndex: asked.pageIndex, selection: keptSelection, rowCount };
  });

  React.useEffect(
    () => {
      if (view !== asked) {
        onStateChange?.(view, 'rows');
      }
    },
    [ asked, onStateChange, view ]
  );

  React.useEffect(
    () => {
      if (selection !== keptSelection) {
        onSelectionChange?.(EMPTY_SELECTION);
      }
    },
    [ keptSelection, onSelectionChange, selection ]
  );

  /* Back from a detail: the code of the row it opened */
  React.useEffect(
    () => {
      if (!focusRowId || focusedRowRef.current === focusRowId || !rowById.has(focusRowId)) {
        return;
      }

      focusedRowRef.current = focusRowId;

      const row = gridRef.current?.querySelector<HTMLElement>(`tr[data-row-id="${CSS.escape(focusRowId)}"]`);
      /*
       * The link inside the code cell first, the cell after: one selector for both returned the cell,
       * which comes first in the document, and a cell holding a link has no tab index, so the focus
       * went nowhere. The grid makes the same choice (a link in a cell takes its focus).
       */
      const codeCell = row?.querySelector<HTMLElement>('[data-kind="code"]');
      const target = codeCell?.querySelector<HTMLElement>('[data-grid-target]') ?? codeCell;

      target?.scrollIntoView({ block: 'center' });
      target?.focus({ preventScroll: true });
    }
  );

  React.useEffect(() => {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return undefined;
    }

    const observer = new ResizeObserver(handleScroll);

    observer.observe(scroller);

    return () => observer.disconnect();
  }, []);

  React.useEffect(handleScroll, [ rows.length, visibleColumns.length ]);


  // ----
  // Layout Computation
  // ----
  const count = selectionCount(selection, rowCount);
  const chosen = selectable && count > 0;
  const firstLoad = status === 'loading' && rows.length === 0;
  const failedEmpty = status === 'error' && rows.length === 0;
  const failedPage = status === 'error' && rows.length > 0;
  const noRows = status === 'ready' && rows.length === 0;
  const showFooter = !firstLoad && !failedEmpty && !noRows && rowCount > Math.min(...pageSizeOptions);
  const codeFirst = visibleColumns[0]?.kind === 'code';
  const pinCodeAt = selectable ? 'start-10' : 'start-0';
  const hasActions = rowActions !== undefined;
  const span = visibleColumns.length + (selectable ? 1 : 0) + (hasActions ? 1 : 0);
  const pageState = pageSelectionState(selection, choosablePageIds);
  const allActionsOnFilter = selectionActions.every((action) => action.supportsAll === true);
  const minSteps = visibleColumns.reduce((sum, column) => sum + COLUMN_STEPS[column.width ?? 'md'], 0)
    + (selectable ? SELECT_COLUMN_STEPS : 0) + (hasActions ? ACTIONS_COLUMN_STEPS : 0);

  let selectionExtra: React.ReactNode = null;

  if (chosen && selection.all) {
    selectionExtra = <Button size={'sm'} fill={'plain'} tone={'primary'} onClick={clearSelection}>{labels.clearSelection}</Button>;
  }
  else if (chosen && allActionsOnFilter && pageState === 'all' && rowCount > count) {
    selectionExtra = (
      <Button size={'sm'} fill={'plain'} tone={'primary'} onClick={() => setSelection({ all: true, excludedIds: [] })}>
        {labels.selectAll(rowCount)}
      </Button>
    );
  }


  // ----
  // Render Parts
  // ----
  const renderHeader = (column: TableColumn<TData>, index: number): React.ReactNode => {
    const sortIndex = view.sorting.findIndex((sort) => sort.id === column.id);
    const sort = sortIndex >= 0 ? view.sorting[sortIndex] : undefined;
    const direction = sort ? (sort.desc ? 'desc' : 'asc') : false;
    const align = columnAlign(column);
    const pinned = index === 0 && codeFirst;

    const label = <span data-truncate className={'block min-w-0 truncate'}>{column.header}</span>;

    const content = column.sortable
      ? (
        <Stack
          as={'button'}
          type={'button'}
          data-slot={'table-sort'}
          data-grid-target
          inline
          direction={'horizontal'}
          align={'center'}
          gap={1}
          className={cn(
            'group/sort -mx-1 h-6 max-w-full rounded-sm px-1 outline-none',

            /* Under the pointer only the ink darkens: no fill, the header stays light */
            'transition-colors duration-100 hover:text-foreground motion-reduce:transition-none',
            'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring',
            direction !== false && 'text-foreground',
            align === 'end' && 'flex-row-reverse'
          )}
          onClick={(event) => sortBy(column, event.shiftKey)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              sortBy(column, event.shiftKey);
            }
          }}
        >
          {label}
          {view.sorting.length > 1 && sort && <span aria-hidden className={'text-xs font-semibold tabular-nums'}>{sortIndex + 1}</span>}
          <SortArrow direction={direction} />
          {sortIndex > 0 && sort && <span className={'sr-only'}>{`, ${labels.sortPriority(sortIndex + 1, sort.desc ? 'desc' : 'asc')}`}</span>}
        </Stack>
      )
      : label;

    return (
      <TooltipPrimitive.Trigger
        key={column.id}
        handle={tooltipHandle}
        payload={column.header}
        render={(
          <th
            scope={'col'}
            data-slot={'table-header-cell'}
            data-kind={column.kind}
            aria-sort={sortIndex === 0 ? (sort?.desc ? 'descending' : 'ascending') : undefined}
            className={cn(HEAD, ALIGN_CLASS[align], pinned && cn(PIN_START, pinCodeAt, 'z-30'))}
          />
        )}
      >
        {content}
      </TooltipPrimitive.Trigger>
    );
  };

  const renderCell = (column: TableColumn<TData>, row: TData, rowId: string, index: number): React.ReactNode => {
    const align = columnAlign(column);
    const pinned = index === 0 && codeFirst;
    const text = cellText(column, readCellValue(column, row), formats);

    const cellProps = {
      'data-slot': 'table-cell',
      'data-kind': column.kind,
      id         : column.kind === 'code' ? `${baseId}-code-${rowId}` : undefined,
      className  : cn(CELL, ALIGN_CLASS[align], pinned && cn(PIN_START, pinCodeAt))
    };

    const content = <CellContent column={column} row={row} formats={formats} labels={labels} />;

    if (text === null) {
      return <td key={column.id} {...cellProps}>{content}</td>;
    }

    return (
      <TooltipPrimitive.Trigger key={column.id} handle={tooltipHandle} payload={text} render={<td {...cellProps} />}>
        {content}
      </TooltipPrimitive.Trigger>
    );
  };

  const renderRowActions = (row: TData, rowId: string): React.ReactNode => {
    const spec = rowActions?.(row);

    if (!spec || spec.actions.length === 0) {
      return <td data-slot={'table-row-actions'} data-empty className={cn(CELL, 'ps-3 pe-2')} />;
    }

    const codeId = `${baseId}-code-${rowId}`;
    const inline = chosen ? [] : (spec.inline ?? []).slice(0, 2);

    return (
      <td data-slot={'table-row-actions'} className={cn(CELL, 'ps-3 pe-2 text-end')}>
        <Stack
          as={'span'}
          data-slot={'table-row-actions-buttons'}
          inline
          direction={'horizontal'}
          align={'center'}
          justify={'end'}
          gap={1}
        >
          {inline.map((id) => {
            const action = spec.actions.find((candidate) => candidate.id === id);

            if (!action) {
              return <span key={id} aria-hidden className={'size-control-sm shrink-0'} />;
            }

            return (
              <IconButton
                key={id}
                label={action.label}
                icon={action.icon}
                size={'sm'}
                fill={'plain'}
                tone={'muted'}
                disabled={action.disabled}
                description={action.disabled ? action.description : undefined}
                to={action.to}
                onClick={action.onSelect}
                aria-describedby={codeId}
                data-grid-skip
                tabIndex={-1}
              />
            );
          })}

          <SharedMenuTrigger
            handle={menuHandle}
            id={`${baseId}-menu-${rowId}`}
            payload={{ scope: 'row', id: rowId }}
            render={(
              <IconButton
                label={labels.rowMenu}
                icon={<TableGlyph name={'ellipsis'} />}
                size={'sm'}
                fill={'plain'}
                tone={'muted'}
                aria-describedby={codeId}
                data-grid-target
                onClick={() => setMenuTarget(null)}
              />
            )}
          />
        </Stack>
      </td>
    );
  };

  const renderMenu = (payload: MenuPayload): React.ReactNode => {
    if (payload.scope === 'selection') {
      return selectionMenuItems(selectionActions, selection, count, true);
    }

    const row = rowById.get(payload.id);
    const spec = row ? rowActions?.(row) : null;

    return spec?.actions.map((action, index) => {
      const previous = spec.actions[index - 1];
      const separate = action.tone === 'destructive' && previous !== undefined && previous.tone !== 'destructive';

      return (
        <React.Fragment key={action.id}>
          {separate && <Menu.Separator />}
          <Menu.Item
            icon={action.icon}
            tone={action.tone}
            disabled={action.disabled}
            description={action.disabled ? action.description : undefined}
            onSelect={action.onSelect}
            to={action.to}
          >
            {action.label}
          </Menu.Item>
        </React.Fragment>
      );
    });
  };

  const renderState = (): React.ReactNode => {
    let state: React.ReactNode = null;

    if (failedEmpty) {
      const invalid = error?.retryable === false;

      state = (
        <EmptyState
          kind={invalid ? 'invalid-view' : 'error'}
          size={'panel'}
          icon={<TableGlyph name={invalid ? 'funnelX' : 'alert'} />}
          title={invalid ? labels.invalidView : labels.error}
          description={invalid ? labels.invalidViewHint : labels.errorHint}
          actions={invalid
            ? (onClearFilters ? [ { label: labels.clearFiltersAndSearch, role: 'clear', onClick: onClearFilters } ] : [])
            : (onRetry ? [ { label: labels.retry, role: 'retry', onClick: onRetry } ] : [])}
        />
      );
    }
    else if (noRows && (filterKey !== '' || searchActive || !empty)) {
      state = (
        <EmptyState
          kind={'no-results'}
          size={'panel'}
          icon={<TableGlyph name={'searchX'} />}
          title={labels.noResults}
          description={labels.noResultsHint}
          actions={onClearFilters && (filterKey !== '' || searchActive)
            ? [ { label: searchActive ? labels.clearFiltersAndSearch : labels.clearFilters, role: 'clear', onClick: onClearFilters } ]
            : []}
        />
      );
    }
    else if (noRows && empty) {
      state = (
        <EmptyState
          kind={'first-use'}
          size={'panel'}
          icon={empty.icon}
          title={empty.title}
          description={empty.description}
          actions={empty.action ? [ { ...empty.action, role: 'create' } ] : []}
        />
      );
    }

    if (!state) {
      return null;
    }

    return (
      <tr>
        <td colSpan={span} data-slot={'table-state'} className={'border-b-0 p-0'}>{state}</td>
      </tr>
    );
  };

  const renderSkeleton = (): React.ReactNode => (
    <SkeletonRows rows={SKELETON_ROWS} columns={visibleColumns} leading={selectable} trailing={hasActions} slot={'table-skeleton-row'} />
  );


  // ----
  // Component Render
  // ----
  return (
    <Stack
      gap={0}
      {...rest}
      data-slot={'table'}
      /* The mode of the table: a part named by its slot carries no layout attribute of the stack */
      data-mode={mode}
      data-status={status}
      className={cn('min-h-0', baseClasses, className)}
    >
      <Stack
        data-slot={'table-toolbar'}
        direction={'horizontal'}
        align={'center'}
        gap={2}
        className={'mb-3 h-7 min-w-0 shrink-0'}
      >
        {chosen
          ? (
            <TableSelectionBar
              text={selection.all ? labels.allSelected(count, selection.excludedIds.length) : labels.selected(count)}
              extra={selectionExtra}
              actions={selectionActions}
              inline={inlineSelectionActions}
              selection={selection}
              count={count}
              onClear={clearSelection}
              labels={{ deselect: labels.deselect, moreActions: labels.moreActions, menu: labels.selectionMenuLabel(count) }}
            />
          )
          : (
            <React.Fragment>
              <Stack gap={0} data-slot={'table-toolbar-content'} direction={'horizontal'} align={'center'} className={'min-w-0 flex-1'}>
                {toolbar}
              </Stack>
              <span data-slot={'table-count'} aria-live={'polite'} className={'shrink-0 text-xs text-muted-foreground tabular-nums'}>
                {firstLoad || failedEmpty ? '' : labels.count(rowCount)}
              </span>
              <TableColumnsButton
                columns={columns}
                visibility={visibility}
                onVisibilityChange={setVisibility}
                onReset={() => setVisibility(defaultVisibility(columns))}
                labels={labels}
              />
            </React.Fragment>
          )}
      </Stack>

      <Stack gap={0} data-slot={'table-card'} className={'relative min-h-0 overflow-hidden rounded-lg bg-card shadow-sm'}>
        {/* On the line under the header, which is the first thing in the card */}
        {fetching && <LoadingBar className={'absolute inset-x-0 top-8 z-30 -mt-0.5'} />}

        <div
          ref={scrollerRef}
          data-slot={'table-scroller'}
          onScroll={handleScroll}
          className={'group/scroller relative isolate min-h-0 overflow-auto overscroll-contain scrollbar-thin'}
        >
          <table
            ref={gridRef}
            role={'grid'}
            data-slot={'table-grid'}
            aria-rowcount={firstLoad ? -1 : rowCount + 1}
            aria-multiselectable={selectable || undefined}
            aria-busy={fetching || firstLoad || undefined}
            onKeyDown={grid.onKeyDown}
            onFocus={grid.onFocus}
            style={{ minWidth: `calc(var(--spacing) * ${minSteps})` }}
            className={'w-full table-fixed border-separate border-spacing-0 text-sm tabular-nums'}
          >
            <caption className={'sr-only'}>{caption}</caption>

            <ColumnGroup columns={visibleColumns} leading={selectable} trailing={hasActions} />

            <thead data-slot={'table-head'}>
              <tr aria-rowindex={1}>
                {selectable && (
                  <th scope={'col'} data-slot={'table-select-all'} className={cn(HEAD, PIN_START, 'start-0 z-30 ps-3 pe-0')}>
                    <Checkbox
                      aria-label={labels.selectPage}
                      checked={pageState === 'all'}
                      indeterminate={pageState === 'some'}
                      disabled={choosablePageIds.length === 0}
                      onCheckedChange={togglePage}
                    />
                  </th>
                )}
                {visibleColumns.map(renderHeader)}
                {hasActions && (
                  <th scope={'col'} data-slot={'table-actions-header'} className={HEAD}>
                    <span className={'sr-only'}>{labels.actionsHeader}</span>
                  </th>
                )}
              </tr>
            </thead>

            <tbody
              data-slot={'table-body'}
              onContextMenu={handleContextMenu}
              className={cn(fetching && 'pointer-events-none opacity-70')}
            >
              {firstLoad && renderSkeleton()}
              {renderState()}
              {!firstLoad && rows.map((engineRow, index) => {
                const row = engineRow.original as unknown as TData;
                const rowId = engineRow.id;
                const reason = selectable ? enableRowSelection?.(row) ?? true : true;

                /* A row that cannot be chosen never shows as chosen, even when every row of the filter is */
                const isChosen = selectable && reason === true && isRowSelected(selection, rowId);

                return (
                  <tr
                    key={rowId}
                    data-slot={'table-row'}
                    data-row-id={rowId}
                    data-grid-row
                    data-selected={isChosen || undefined}
                    aria-selected={selectable ? isChosen : undefined}
                    aria-rowindex={view.pageIndex * view.pageSize + index + 2}
                    className={ROW}
                  >
                    {selectable && (
                      <td
                        data-slot={'table-select-cell'}
                        className={cn(
                          CELL,
                          PIN_START,
                          'start-0 ps-3 pe-0',
                          'border-s-2 border-s-transparent group-data-selected/row:border-s-primary'
                        )}
                        onClick={(event) => {
                          /* The click the checkbox fires for Space: the key has already chosen the row */
                          if (event.detail === 0 && (event.target as Element).closest('[role="checkbox"]')) {
                            return;
                          }

                          toggleRow(rowId, event.shiftKey);
                        }}
                      >
                        {reason === true
                          ? (
                            /* Controlled with no handler of its own: the click of the cell carries Shift, the change does not */
                            <Checkbox aria-label={labels.selectRow(row)} checked={isChosen} className={'align-middle'} />
                          )
                          : (
                            <Tooltip content={reason}>
                              <Stack
                                gap={0}
                                as={'span'}
                                data-slot={'table-select-blocked'}
                                inline
                                direction={'horizontal'}
                                className={'align-middle'}
                              >
                                <Checkbox aria-label={labels.selectRow(row)} checked={isChosen} readOnly />
                              </Stack>
                            </Tooltip>
                          )}
                      </td>
                    )}

                    {visibleColumns.map((column, columnIndex) => renderCell(column, row, rowId, columnIndex))}

                    {hasActions && renderRowActions(row, rowId)}
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div
            aria-hidden
            className={cn(
              'pointer-events-none sticky start-0 bottom-0 z-20 -mt-2 h-2 bg-linear-to-t from-scroll-shade to-transparent opacity-0',
              'group-data-more-y/scroller:opacity-100'
            )}
          />
        </div>

        {showFooter && (
          <TablePagination
            pageIndex={view.pageIndex}
            pageSize={view.pageSize}
            rowCount={rowCount}
            shown={rows.length}
            pageSizeOptions={pageSizeOptions}
            onPageChange={(pageIndex) => commit({ ...view, pageIndex }, 'page')}
            onPageSizeChange={(pageSize) => commit({ ...view, pageSize, pageIndex: 0 }, 'pageSize')}
            failed={failedPage ? { onRetry } : undefined}
            labels={labels}
          />
        )}
      </Stack>

      <span className={'sr-only'} aria-live={'polite'}>{announcement}</span>

      <SharedMenu<MenuPayload>
        handle={menuHandle}
        anchor={menuTarget?.anchor}
        label={(payload) => {
          const effective = menuTarget?.payload ?? payload;
          const row = rowById.get(effective.id);

          return effective.scope === 'selection' || !row ? labels.selectionMenuLabel(count) : labels.rowMenuLabel(row);
        }}
        onOpenChange={(open) => {
          if (!open) {
            setMenuTarget(null);
          }
        }}
      >
        {(payload) => renderMenu(menuTarget?.payload ?? payload)}
      </SharedMenu>

      <TruncationTooltip handle={tooltipHandle} />
    </Stack>
  );

}

Table.displayName = 'Table';
