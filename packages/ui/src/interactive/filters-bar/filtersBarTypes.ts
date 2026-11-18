import type * as React from 'react';

import type { CalendarLabels, CalendarRange, DayMeta } from '../calendar/Calendar';
import type { ComboboxItem } from '../combobox/comboboxTypes';


/* --------
 * Filters
 * -------- */

/** A value of a list: the key, its name, and on a server list its code and second line */
export type FilterOption = ComboboxItem;

interface FilterBase {
  /** Stable: the key of the filter in the address and in the preferences */
  readonly id: string;

  /** The name of the filter, already translated: a noun, "Status", "Opening" */
  readonly label: string;

  /**
   * Off in this page, still reachable: the tooltip says `disabledReason`. Never with a value: a filter
   * that does not apply to a page is left out of the bar
   */
  readonly disabled?: boolean;
  readonly disabledReason?: React.ReactNode;

  /** Its values are on their way: a spinner in place of the arrow, and the list does not open */
  readonly loading?: boolean;
}

/** One value from a list: a tick on the right, and choosing closes */
export interface SingleListFilter extends FilterBase {
  readonly kind?: 'list';
  readonly multiple?: false;
  readonly options: readonly FilterOption[];
  readonly value: string | null;
  readonly onValueChange: (value: string | null) => void;
}

/** Several values from a list: a box per value, "Select all" and "Clear" in the footer */
export interface MultipleListFilter extends FilterBase {
  readonly kind?: 'list';
  readonly multiple: true;
  readonly options: readonly FilterOption[];

  /** In the order of the list */
  readonly value: readonly string[];
  readonly onValueChange: (value: string[]) => void;
}

/**
 * Several values from a list searched on the server: the panel of the Combobox with several values.
 * The values of the active filter read their names from `selectedItems`, never from the results.
 */
export interface RemoteListFilter extends FilterBase {
  readonly kind: 'remote';

  readonly value: readonly string[];
  readonly selectedItems: readonly FilterOption[];
  readonly onValueChange: (value: string[], items: FilterOption[]) => void;

  /** The results of the current search */
  readonly items: readonly FilterOption[];

  /** Every change of the text typed: the caller's search term. Another filter's value may narrow it */
  readonly onSearchChange: (text: string) => void;

  readonly searching?: boolean;
  readonly searchError?: boolean;
  readonly onRetry?: () => void;
  readonly hasMore?: boolean;

  /** Under this many characters nothing is searched. Defaults to 2 */
  readonly minChars?: number;
}

/** A period, from the calendar alone: one end may stay open */
export interface DateFilter extends FilterBase {
  readonly kind: 'date';

  /** Ends as `"2026-11-16"`, either may be `null` */
  readonly value: CalendarRange;
  readonly onValueChange: (value: CalendarRange) => void;

  readonly min?: string;
  readonly max?: string;
  readonly isDateUnavailable?: (day: string) => boolean;
  readonly dayMeta?: (day: string) => DayMeta | undefined;

  /** The language of names and of the first day of the week. dayjs must have it loaded */
  readonly locale?: string;
}

export type FiltersBarFilter = SingleListFilter | MultipleListFilter | RemoteListFilter | DateFilter;


/* --------
 * Search
 * -------- */

export interface FiltersBarSearch {
  readonly value: string;
  readonly onValueChange: (value: string) => void;

  /** An example, "E.g. SG-2041" */
  readonly placeholder?: string;

  /** What it searches: the accessible name of the field and its tooltip */
  readonly label: string;
}


/* --------
 * Texts
 * -------- */

export interface FiltersBarDateLabels extends CalendarLabels {
  /** The footer after one click: "From this date" */
  readonly from: string;

  /** "Until this date" */
  readonly until: string;

  /** The value of an active date filter: "09/11 – 22/11/2026", "from 01/11/2026", "until 30/11/2026" */
  readonly value: (range: CalendarRange) => string;
}

/** The texts of a server list, as in the Combobox */
export interface FiltersBarRemoteLabels {
  /** "Type at least 2 characters" */
  readonly minChars: string;

  /** "Searching…", only when the answer is slow */
  readonly searching: string;

  /** Announced on arrival: "5 contracts found" */
  readonly results: (count: number) => string;

  /** "No contract for «rossx»" */
  readonly noResults: (text: string) => string;

  /** "First 50 shown: type more to narrow the search" */
  readonly tooMany: (count: number) => string;

  readonly error: string;
  readonly retry: string;
}

/** Every text of the bar, separators included: the package writes none */
export interface FiltersBarLabels {
  /** "More filters" */
  readonly more: string;

  /** "Filters", the one button of a bar too narrow for the first filter */
  readonly all: string;

  /** "Clear filters" */
  readonly clearAll: string;

  /** Name and tooltip of the arrow that goes back to the names in "More filters" */
  readonly back: string;

  /** The footer of a list: "Select all", "Clear" */
  readonly selectAll: string;
  readonly clear: string;

  /** The placeholder of the search of a long list */
  readonly search: string;

  /** The line in place of an empty list */
  readonly noResults: string;

  /** The name of the spinner of a filter whose values are loading */
  readonly loading: string;

  /** Name and tooltip of the x of the search */
  readonly clearSearch: string;

  /** After "More filters" when some of its filters are active: "· 2" */
  readonly activeCount: (count: number) => string;

  /** Name and tooltip of the x of an active filter: "Remove Status" */
  readonly remove: (name: string) => string;

  /** The name in an active filter, with its separator: "Status:" */
  readonly activeName: (name: string) => string;

  /** The first values of an active filter: "Open, In progress" */
  readonly values: (labels: readonly string[]) => string;

  /** The values past the first two, never truncated: "+3" */
  readonly moreValues: (count: number) => string;

  /** The closing line of the tooltip of the values past the tenth: "and 4 more" */
  readonly restValues: (count: number) => string;

  readonly date: FiltersBarDateLabels;
  readonly remote: FiltersBarRemoteLabels;
}
