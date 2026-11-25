import type * as React from 'react';

import type { LinkTarget } from '../../core/link';
import type { Tone, ToneFill } from '../../core/tone';

import type { AvatarGroupItem, AvatarIdentity } from '../../display/person/Person';


/* --------
 * Columns
 * -------- */

/** What a column holds: format, alignment, the direction of the first click, the width and the empty value follow */
export type TableColumnKind =
  | 'code'
  | 'reference'
  | 'person'
  | 'text'
  | 'enum'
  | 'status'
  | 'date'
  | 'datetime'
  | 'number'
  | 'boolean'
  | 'custom';

/** The formats of a `number` column, applied by the formatters the application provides */
export type TableNumberFormat =
  | 'integer'
  | 'decimal'
  | 'quantity'
  | 'weight'
  | 'distance'
  | 'percentage'
  | 'duration'
  | 'currency';

/** 64, 96, 140 and 200px, or the rest of the row: one column only takes it */
export type TableColumnWidth = 'xs' | 'sm' | 'md' | 'lg' | 'fill';

/** A person in a `person` cell: the avatar, the name and, when it has one, the page it opens */
export interface TablePersonValue {
  readonly avatar: AvatarIdentity;
  readonly name: string;
  readonly target?: LinkTarget;
}

/** The tone of a status badge, from the module's map of the value */
export interface TableStatusTone {
  readonly tone: Tone;
  readonly fill?: ToneFill;
}

interface TableColumnBase<TData> {
  /** Stable: the key of the order and of the user's preferences */
  readonly id: string;

  /** The header, already translated */
  readonly header: string;

  /** Where the value is read: a key of the row, or a function. Defaults to the key named like the `id` */
  readonly accessor?: (keyof TData & string) | ((row: TData) => unknown);

  /** Defaults to `md`; `fill` takes the rest of the row */
  readonly width?: TableColumnWidth;

  /** The column sorts only when it says so */
  readonly sortable?: boolean;

  /** The field the server sorts by, when it differs from the `id`. Read by `sortingToFields` */
  readonly sortKey?: string;

  /** Whether "Columns" can hide it. Defaults to `true`; a `code` column never hides */
  readonly hideable?: boolean;

  /** Hidden until the user shows it */
  readonly defaultHidden?: boolean;
}

/** A link to the record: weight 500, the first column after the checkbox, pinned, never hidden */
export interface TableCodeColumn<TData> extends TableColumnBase<TData> {
  readonly kind: 'code';
  readonly target?: (row: TData) => LinkTarget | undefined;
}

/** Another entity (a town, a contract): a link at weight 400, or text without a destination */
export interface TableReferenceColumn<TData> extends TableColumnBase<TData> {
  readonly kind: 'reference';
  readonly target?: (row: TData) => LinkTarget | undefined;
}

/**
 * One person (`TablePersonValue`) with avatar 24 and the name as a link, or several
 * (`AvatarGroupItem[]`) as an avatar group, which never sorts. Sorted by the name, as it reads.
 */
export interface TablePersonColumn<TData> extends TableColumnBase<TData> {
  readonly kind: 'person';

  /** The name and the head of the list of a group: "Operators: Rossi Mario, Bianchi Laura" */
  readonly group?: (items: readonly AvatarGroupItem[], row: TData) => { label: string; title: React.ReactNode };
}

/** Text, an enum label, a date or a boolean: nothing to add to the column */
export interface TablePlainColumn<TData> extends TableColumnBase<TData> {
  readonly kind: 'text' | 'enum' | 'date' | 'datetime' | 'boolean';
}

/** A badge with its dot: the label from the enum formatter, tone and fill from the module's map */
export interface TableStatusColumn<TData> extends TableColumnBase<TData> {
  readonly kind: 'status';
  readonly tone: (value: unknown, row: TData) => TableStatusTone;
}

/** Right aligned, tabular figures, unit and decimals from the formatter */
export interface TableNumberColumn<TData> extends TableColumnBase<TData> {
  readonly kind: 'number';

  /** Defaults to `integer` */
  readonly format?: TableNumberFormat;
}

/** The way out for what the kinds do not cover. It has to be justified in review */
export interface TableCustomColumn<TData> extends TableColumnBase<TData> {
  readonly kind: 'custom';
  readonly cell: (row: TData) => React.ReactNode;

  /** Defaults to `start` */
  readonly align?: 'start' | 'center' | 'end';

  /** The direction of the first click. Defaults to ascending */
  readonly sortDescFirst?: boolean;
}

export type TableColumn<TData> =
  | TableCodeColumn<TData>
  | TableReferenceColumn<TData>
  | TablePersonColumn<TData>
  | TablePlainColumn<TData>
  | TableStatusColumn<TData>
  | TableNumberColumn<TData>
  | TableCustomColumn<TData>;


/* --------
 * State
 * -------- */

/** One column of the order */
export interface TableSort {
  readonly id: string;
  readonly desc: boolean;
}

/** Everything a page keeps of a table, usually in its address */
export interface TableViewState {
  /** Never empty: the default order shows its arrow too */
  readonly sorting: readonly TableSort[];
  readonly pageIndex: number;
  readonly pageSize: number;

  /** `false` for a hidden column; a column missing from the map follows its `defaultHidden` */
  readonly columnVisibility: Readonly<Record<string, boolean>>;
}

/** What changed, for a page that writes only some parts to the address */
export type TableStateChange = 'sorting' | 'page' | 'pageSize' | 'columnVisibility' | 'filters' | 'rows';

/**
 * The rows chosen: by id, or every row of the filter but a few. Outside the engine, because the
 * engine can only choose rows it has loaded.
 */
export type TableSelection =
  | { readonly all?: false; readonly ids: readonly string[] }
  | { readonly all: true; readonly excludedIds: readonly string[] };

export type TableStatus = 'loading' | 'fetching' | 'error' | 'ready';


/* --------
 * Actions
 * -------- */

/** An action on a row, as data: the ⋯ shows them all, the row up to two of them as icon buttons */
export interface TableRowAction {
  readonly id: string;
  readonly label: string;

  /** A Lucide icon at 16px. Every action of the menu has one, or none has */
  readonly icon?: React.ReactNode;

  /** The destructive one goes last, after a separator, and always opens a confirmation */
  readonly tone?: 'default' | 'destructive';

  /** Reachable and not run: `description` says why. An action not available without a reason is left out */
  readonly disabled?: boolean;
  readonly description?: React.ReactNode;

  readonly onSelect?: () => void;
  readonly to?: LinkTarget;
}

export interface TableRowActions {
  readonly actions: readonly TableRowAction[];

  /**
   * Up to two ids of `actions`, shown as icon buttons on the row too. An id with no action keeps its
   * place empty: the buttons never slide.
   */
  readonly inline?: readonly string[];
}

/** An action on the selected rows */
export interface TableSelectionAction {
  readonly id: string;
  readonly label: string;

  /** The label in the menu of a right click on a selected row: "Delete 3 reports" */
  readonly menuLabel?: (count: number) => string;

  readonly icon?: React.ReactNode;
  readonly tone?: 'default' | 'destructive';
  readonly disabled?: boolean;
  readonly description?: React.ReactNode;

  /** Whether it works on a filter too: only when every action does, "Select all" appears */
  readonly supportsAll?: boolean;

  readonly onSelect: (selection: TableSelection) => void;
}


/* --------
 * Texts
 * -------- */

/** Every text of the table. The ones naming the entity are written once per entity by the module */
export interface TableLabels<TData> {
  /** The hidden header of the actions column: "Actions" */
  readonly actionsHeader: string;

  /** Name and tooltip of the ⋯ of a row: "Actions" */
  readonly rowMenu: string;

  /** The name of the menu of a row: "Actions on SG-2038" */
  readonly rowMenuLabel: (row: TData) => string;

  /** The name of the menu of the selection: "Actions on the 3 selected" */
  readonly selectionMenuLabel: (count: number) => string;

  readonly selectPage: string;
  readonly selectRow: (row: TData) => string;

  readonly rowsPerPage: string;
  readonly firstPage: string;
  readonly previousPage: string;
  readonly nextPage: string;
  readonly lastPage: string;

  /** Name and tooltip of the columns button, and title of its panel */
  readonly columns: string;
  readonly columnsReset: string;

  /** Under the code column in the panel: why it cannot be hidden */
  readonly columnsLocked: string;

  /** The close button of the columns panel */
  readonly close: string;

  /** The accessible name of "—" */
  readonly noValue: string;
  readonly yes: string;
  readonly no: string;

  readonly retry: string;
  readonly clearFilters: string;
  readonly clearFiltersAndSearch: string;

  /** "Clear selection", when every row of the filter is selected */
  readonly clearSelection: string;

  /** "Deselect", at the end of the selection bar */
  readonly deselect: string;

  /** Name and tooltip of the ⋯ of the selection bar: "More actions" */
  readonly moreActions: string;

  /** "No report with these filters" */
  readonly noResults: string;
  readonly noResultsHint?: string;

  readonly error: string;
  readonly errorHint?: string;
  readonly invalidView: string;
  readonly invalidViewHint?: string;

  /** "312 reports", with the domain plural */
  readonly count: (count: number) => string;

  /** "1–50 of 312" */
  readonly range: (from: number, to: number, total: number) => string;

  /** "3 reports selected" */
  readonly selected: (count: number) => string;

  /** "Select all 312" */
  readonly selectAll: (count: number) => string;

  /** "311 reports selected, all but 1" */
  readonly allSelected: (count: number, excluded: number) => string;

  /** The announcement of a new order: "Sorted by Town, ascending" */
  readonly sortedBy: (column: string, direction: 'asc' | 'desc') => string;

  /** In the name of a sort button past the first: "second sort, ascending" */
  readonly sortPriority: (position: number, direction: 'asc' | 'desc') => string;

  /** The description of the columns button when the columns are not the default ones: "2 changed" */
  readonly columnsChanged: (count: number) => string;

  /** In the footer, when a page did not arrive: "Rows 101–150 did not arrive." */
  readonly rowsError: (from: number, to: number) => string;
}

/** The empty table at first use: the page's text and, unless it is already in the header, an action */
export interface TableEmpty {
  readonly icon: React.ReactNode;
  readonly title: React.ReactNode;
  readonly description?: React.ReactNode;
  readonly action?: {
    readonly label: string;
    readonly onClick?: () => void;
    readonly target?: LinkTarget;
    readonly icon?: React.ReactNode;
  };
}
