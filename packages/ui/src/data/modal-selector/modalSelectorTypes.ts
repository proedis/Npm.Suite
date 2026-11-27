import type * as React from 'react';

import type { DialogDiscard } from '../../overlays/dialog/Dialog';

import type { FiltersBarFilter, FiltersBarLabels, FiltersBarSearch } from '../filters-bar/filtersBarTypes';
import type { TableColumn, TableCustomColumn, TableSelection, TableStatus } from '../table/tableTypes';


/* --------
 * Columns and rows
 * -------- */

type WithoutLinks<C> = C extends unknown ? Omit<C, 'target' | 'sortable' | 'sortKey' | 'hideable' | 'defaultHidden'> : never;

/**
 * A column of the Table, without `custom`, sorting and links: the code does not open the detail
 * here, and the order is the server's (relevance, the exact code first). Four at most, one `fill`.
 */
export type ModalSelectorColumn<TData> = WithoutLinks<Exclude<TableColumn<TData>, TableCustomColumn<TData>>>;

/** What names a row in the field, the footer and the chips */
export interface ModalSelectorRowLabel {
  readonly label: string;
  readonly code?: string;
}

/** A row that cannot be chosen: a short note after the name, the whole reason for assistive technology */
export interface ModalSelectorRowBlock {
  readonly note: string;
  readonly reason: string;
}


/* --------
 * Texts
 * -------- */

/** One instruction of the line of keys: `{ keys: [ '↑', '↓' ], label: 'rows' }` */
export interface ModalSelectorKey {
  readonly keys: readonly string[];
  readonly label: string;
}

export interface ModalSelectorLabels {
  /** The x of the dialog */
  readonly close: string;
  readonly cancel: string;

  /** The name of the list of rows */
  readonly caption: string;

  /** "Show only the chosen ones", the button of the footer */
  readonly showOnlySelected: string;

  /** "Only the chosen ones", the filter that button puts in the toolbar */
  readonly onlySelected: string;

  /** Name and tooltip of the x of that filter */
  readonly removeOnlySelected: string;

  /** What a cell reads: the accessible name of "—", and the two booleans */
  readonly noValue: string;
  readonly yes: string;
  readonly no: string;

  /** The note of the row of the current value: "Current" */
  readonly currentNote: string;

  /** "No contract with these filters" */
  readonly noResultsFilters: string;
  readonly noResultsHint?: string;
  readonly clearFilters: string;
  readonly clearFiltersAndSearch: string;

  readonly error: string;
  readonly errorHint?: string;
  readonly retry: string;

  /** At the top of the body when the confirmation failed: the choices stay */
  readonly confirmError: React.ReactNode;

  /** The veil while confirming */
  readonly busySubmit?: string;

  /** The instructions of the search, the same as the line of keys, for assistive technology */
  readonly instructions: string;

  /** The line of keys, hidden from assistive technology */
  readonly keys: readonly ModalSelectorKey[];

  /** "Current value: Rossi Anna · UT-004813" */
  readonly current: (label: string, code?: string) => string;

  /** "7 contracts for «ross»", "312 contracts" */
  readonly count: (count: number, query: string) => string;

  /** "First 50 of 312 contracts. Narrow with the search or the filters.", or "More than 50 contracts" without a total */
  readonly more: (limit: number, total: number | null) => string;

  /** "3 contracts selected" */
  readonly selected: (count: number) => string;

  /** "Select all 312" */
  readonly selectAll: (count: number) => string;

  /** "311 contracts, all but 1" */
  readonly allSelected: (count: number, excluded: number) => string;

  /** "No contract for «rossy»" */
  readonly noResults: (query: string) => string;

  /** The texts of the filters and of the search */
  readonly filtersBar: FiltersBarLabels;
}


/* --------
 * Props
 * -------- */

export interface ModalSelectorCommonProps<TData> {
  /** Controlled, as the Dialog */
  open: boolean;
  onOpenChange: (open: boolean) => void;

  title: React.ReactNode;

  /** The context: "Contract of the signal" */
  description?: React.ReactNode;

  /** `muted` from a field, `primary` from an action */
  icon?: React.ReactNode;
  iconTone?: 'primary' | 'muted';

  columns: readonly ModalSelectorColumn<TData>[];

  /** The rows in view: at most `limit` (one more is cut, it only says there are others) */
  rows: readonly TData[];

  /** More rows than shown exist */
  hasMore?: boolean;

  /** The total, when the server gives it */
  rowCount?: number;

  /** `client`: every row is passed, the dialog searches them itself and never waits. Defaults to `server` */
  mode?: 'server' | 'client';

  /** As the Table. Defaults to `ready` */
  status?: TableStatus;
  onRetry?: () => void;

  getRowId: (row: TData) => string;
  getRowLabel: (row: TData) => ModalSelectorRowLabel;

  /** `search.label` is what it searches, `search.placeholder` an example */
  search: FiltersBarSearch;

  /** As the FiltersBar. In `client` mode the caller filters `rows` itself */
  filters?: readonly FiltersBarFilter[];
  onClearFilters?: () => void;

  /** `true`, or a note and the reason a row cannot be chosen */
  enableRowSelection?: (row: TData) => true | ModalSelectorRowBlock;

  /** Defaults to 50 */
  limit?: number;

  /** The primary: "Choose", "Add 3 contracts". With several values it gets the count, 0 too */
  confirmLabel: (count: number) => string;

  /** Where the focus goes on closing when the control that opened it is gone */
  returnFocus?: { readonly current: HTMLElement | null };

  labels: ModalSelectorLabels;
}

export interface StrictSingleModalSelectorProps<TData> extends ModalSelectorCommonProps<TData> {
  multiple?: false;

  /** The value it opens on, and its whole row: the footer shows it even when no search finds it */
  value: string | null;
  selectedRow: TData | null;

  /** A promise keeps the dialog open behind the veil until it settles; a rejection shows `confirmError` */
  onConfirm: (value: string, row: TData) => void | Promise<unknown>;
}
export type SingleModalSelectorProps<TData> = StrictSingleModalSelectorProps<TData>;


export interface StrictMultipleModalSelectorProps<TData> extends ModalSelectorCommonProps<TData> {
  multiple: true;

  /** The values it opens on, and their whole rows */
  value: readonly string[];
  selectedRows: readonly TData[];

  /** The rows by id, or every row of the filter but a few when `supportsAll` */
  onConfirm: (selection: TableSelection, rows: TData[]) => void | Promise<unknown>;

  /** The action works on a filter too: "Select all" appears in the count line */
  supportsAll?: boolean;

  /** The prompt when closing with choices not confirmed */
  discard: DialogDiscard;
}
export type MultipleModalSelectorProps<TData> = StrictMultipleModalSelectorProps<TData>;


export type StrictModalSelectorProps<TData> = StrictSingleModalSelectorProps<TData> | StrictMultipleModalSelectorProps<TData>;

export type ModalSelectorProps<TData> = SingleModalSelectorProps<TData> | MultipleModalSelectorProps<TData>;
