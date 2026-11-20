import type { TableColumn, TableColumnKind, TableSelection, TableSort, TableViewState } from './tableTypes';


/* --------
 * Sorting
 * -------- */

/** Dates and numbers start from the most recent and the largest, `boolean` from "yes", the rest ascending */
const DESC_FIRST: Readonly<Partial<Record<TableColumnKind, boolean>>> = {
  date    : true,
  datetime: true,
  number  : true,
  boolean : true
};

/** The direction of the first click on a column */
export function firstSortDesc<TData>(column: TableColumn<TData>): boolean {
  if (column.kind === 'custom') {
    return column.sortDescFirst ?? false;
  }

  return DESC_FIRST[column.kind] ?? false;
}

function sameSorting(a: readonly TableSort[], b: readonly TableSort[]): boolean {
  return a.length === b.length && a.every((sort, index) => sort.id === b[index]?.id && sort.desc === b[index]?.desc);
}

/**
 * The order after a click on a sortable header.
 *
 * A plain click: the first in the direction of the kind, the second in the other, the third back to
 * the default order. A column that is the default order already goes from one direction to the other
 * instead of standing still.
 *
 * With Shift the column is added as the second one. Two at most: on a third the first goes and the
 * second moves up. Shift on a column already in the order turns it, then takes it out; an order left
 * empty becomes the default one, because the order is never empty.
 */
export function nextSorting(
  current: readonly TableSort[],
  id: string,
  descFirst: boolean,
  multi: boolean,
  defaultSorting: readonly TableSort[]
): readonly TableSort[] {
  const base = current.length > 0 ? current : defaultSorting;
  const position = base.findIndex((sort) => sort.id === id);
  const existing = position >= 0 ? base[position] : undefined;

  if (!multi) {
    if (!existing) {
      return [ { id, desc: descFirst } ];
    }

    if (existing.desc === descFirst) {
      return [ { id, desc: !descFirst } ];
    }

    const reset = defaultSorting.length > 0 ? defaultSorting : [ { id, desc: descFirst } ];

    /* The default order is the one already on screen: the click would do nothing */
    return sameSorting(reset, [ existing ]) ? [ { id, desc: descFirst } ] : reset;
  }

  if (!existing) {
    return base.length < 2 ? [ ...base, { id, desc: descFirst } ] : [ base[1]!, { id, desc: descFirst } ];
  }

  if (existing.desc === descFirst) {
    return base.map((sort, index) => (index === position ? { id, desc: !descFirst } : sort));
  }

  const rest = base.filter((_, index) => index !== position);

  return rest.length > 0 ? rest : defaultSorting;
}

/** Hiding a sorted column takes it out of the order */
export function withoutHidden(
  sorting: readonly TableSort[],
  isVisible: (id: string) => boolean,
  defaultSorting: readonly TableSort[]
): readonly TableSort[] {
  const visible = sorting.filter((sort) => isVisible(sort.id));

  if (visible.length === sorting.length) {
    return sorting;
  }

  return visible.length > 0 ? visible : defaultSorting.filter((sort) => isVisible(sort.id));
}

/**
 * The order as the server wants it: each column's `sortKey` (or its id) and the direction. The data
 * hook adds the id at the end, so a row never shows up on two pages.
 *
 * ```ts
 * const orderBy = sortingToFields(state.sorting, columns).map(({ desc, field }) => (desc ? `-${field}` : field));
 * ```
 */
export function sortingToFields<TData>(
  sorting: readonly TableSort[],
  columns: readonly TableColumn<TData>[]
): { field: string; desc: boolean }[] {
  return sorting.map((sort) => {
    const column = columns.find((candidate) => candidate.id === sort.id);

    return { field: column?.sortKey ?? sort.id, desc: sort.desc };
  });
}


/* --------
 * Pages
 * -------- */

/** The last page there is: when the rows drop, a page past it is not there any more */
export function lastPageIndex(rowCount: number, pageSize: number): number {
  return Math.max(0, Math.ceil(rowCount / pageSize) - 1);
}

/** The columns in view by default: a key only for the ones hidden */
export function defaultVisibility<TData>(columns: readonly TableColumn<TData>[]): Record<string, boolean> {
  return Object.fromEntries(columns
    .filter((column) => column.defaultHidden && column.kind !== 'code')
    .map((column) => [ column.id, false ]));
}

/** The state a table starts from when the page does not hold it */
export function initialViewState<TData>(
  columns: readonly TableColumn<TData>[],
  defaultSorting: readonly TableSort[],
  pageSize: number
): TableViewState {
  return {
    sorting         : defaultSorting,
    pageIndex       : 0,
    pageSize,
    columnVisibility: defaultVisibility(columns)
  };
}

/** Whether a column is in view: the map first, then its default */
export function isColumnVisible<TData>(column: TableColumn<TData>, visibility: Readonly<Record<string, boolean>>): boolean {
  if (column.kind === 'code') {
    return true;
  }

  return visibility[column.id] ?? !column.defaultHidden;
}

/** How many columns differ from the default ones, for the badge of "Columns" */
export function changedColumns<TData>(
  columns: readonly TableColumn<TData>[],
  visibility: Readonly<Record<string, boolean>>
): number {
  return columns.filter((column) => isColumnVisible(column, visibility) === Boolean(column.defaultHidden)).length;
}


/* --------
 * Selection
 * -------- */

export const EMPTY_SELECTION: TableSelection = { ids: [] };

export function isRowSelected(selection: TableSelection, id: string): boolean {
  return selection.all ? !selection.excludedIds.includes(id) : selection.ids.includes(id);
}

/** How many rows are chosen: with every row of the filter, the total less the ones taken out */
export function selectionCount(selection: TableSelection, rowCount: number): number {
  return selection.all ? Math.max(0, rowCount - selection.excludedIds.length) : selection.ids.length;
}

export function isSelectionEmpty(selection: TableSelection, rowCount: number): boolean {
  return selectionCount(selection, rowCount) === 0;
}

/** Chooses or drops some rows, keeping the others as they were */
export function setRowsSelected(selection: TableSelection, ids: readonly string[], selected: boolean): TableSelection {
  if (selection.all) {
    const excluded = selected
      ? selection.excludedIds.filter((id) => !ids.includes(id))
      : [ ...selection.excludedIds, ...ids.filter((id) => !selection.excludedIds.includes(id)) ];

    return { all: true, excludedIds: excluded };
  }

  return {
    ids: selected
      ? [ ...selection.ids, ...ids.filter((id) => !selection.ids.includes(id)) ]
      : selection.ids.filter((id) => !ids.includes(id))
  };
}

/** The checkbox of the header: the selectable rows of the page, none, some or all chosen */
export function pageSelectionState(selection: TableSelection, pageIds: readonly string[]): 'none' | 'some' | 'all' {
  const chosen = pageIds.filter((id) => isRowSelected(selection, id)).length;

  if (chosen === 0) {
    return 'none';
  }

  return chosen === pageIds.length ? 'all' : 'some';
}

/** The rows between two of the page, both included, in the order on screen */
export function rowsBetween(pageIds: readonly string[], from: string, to: string): string[] {
  const start = pageIds.indexOf(from);
  const end = pageIds.indexOf(to);

  if (start < 0 || end < 0) {
    return [ to ];
  }

  return pageIds.slice(Math.min(start, end), Math.max(start, end) + 1);
}
