import type { DetailLabels } from '@proedis/ui/data/detail';
import type { FiltersBarLabels } from '@proedis/ui/data/filters-bar';
import type { ModalSelectorLabels } from '@proedis/ui/data/modal-selector';
import type { TableFormats, TableLabels } from '@proedis/ui/data/table';


/*
 * What an application writes once and every list reuses: how values read (the formats), and every
 * text of the tables, the filters and the selectors. The package writes no string, so these are the
 * application's, in its language and with its plurals. A real application builds them from its
 * translations; the examples write them in English.
 */


/* --------
 * Formats
 * -------- */

const DATE = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });

const DATETIME = new Intl.DateTimeFormat('en-GB', {
  day     : '2-digit',
  month   : '2-digit',
  year    : 'numeric',
  hour    : '2-digit',
  minute  : '2-digit',
  timeZone: 'UTC'
});

const INTEGER = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 });

const DECIMAL = new Intl.NumberFormat('en-GB', { minimumFractionDigits: 1, maximumFractionDigits: 2 });

const PERCENT = new Intl.NumberFormat('en-GB', { style: 'percent', maximumFractionDigits: 0 });

const EURO = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR' });

/** The names of the domain values: an `enum` or a `status` column reads its label here */
const ENUM_LABELS: Readonly<Record<string, string>> = {
  planned  : 'Planned',
  running  : 'Running',
  completed: 'Completed',
  late     : 'Late',
  cancelled: 'Cancelled',
  domestic : 'Domestic',
  business : 'Business',
  public   : 'Public body'
};

function asDate(value: unknown): Date | null {
  if (typeof value !== 'string' && !(value instanceof Date)) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Mounted once with `TableFormatsProvider`: the Table and the ModalSelector read their values through it */
export const tableFormats: TableFormats = {
  date    : (value) => {
    const date = asDate(value);
    return date ? DATE.format(date) : '';
  },
  datetime: (value) => {
    const date = asDate(value);
    return date ? DATETIME.format(date) : '';
  },
  number: (value, format) => {
    if (typeof value !== 'number') {
      return '';
    }

    switch (format) {
      case 'decimal':
        return DECIMAL.format(value);
      case 'quantity':
        return `${INTEGER.format(value)} pcs`;
      case 'weight':
        return `${INTEGER.format(value)} kg`;
      case 'distance':
        return `${DECIMAL.format(value)} km`;
      case 'percentage':
        return PERCENT.format(value);
      case 'duration':
        return `${Math.floor(value / 60)} h ${String(value % 60).padStart(2, '0')} min`;
      case 'currency':
        return EURO.format(value);
      default:
        return INTEGER.format(value);
    }
  },
  enumLabel: (value) => ENUM_LABELS[String(value)] ?? String(value ?? '')
};


/* --------
 * Table
 * -------- */

/** The texts of a table, for an entity named in the singular and the plural */
export function tableLabels<TData>(
  entity: { one: string; many: string },
  name: (row: TData) => string
): TableLabels<TData> {
  const plural = (count: number): string => `${INTEGER.format(count)} ${count === 1 ? entity.one : entity.many}`;

  return {
    actionsHeader        : 'Actions',
    rowMenu              : 'Actions',
    rowMenuLabel         : (row) => `Actions on ${name(row)}`,
    selectionMenuLabel   : (count) => `Actions on the ${plural(count)} selected`,
    selectPage           : 'Select the rows of this page',
    selectRow            : (row) => `Select ${name(row)}`,
    rowsPerPage          : 'Rows per page',
    firstPage            : 'First page',
    previousPage         : 'Previous page',
    nextPage             : 'Next page',
    lastPage             : 'Last page',
    columns              : 'Columns',
    columnsReset         : 'Restore the default columns',
    columnsLocked        : 'The code always stays',
    close                : 'Close',
    noValue              : 'No value',
    yes                  : 'Yes',
    no                   : 'No',
    retry                : 'Retry',
    clearFilters         : 'Clear filters',
    clearFiltersAndSearch: 'Clear filters and search',
    clearSelection       : 'Clear selection',
    deselect             : 'Deselect',
    moreActions          : 'More actions',
    noResults            : `No ${entity.one} with these filters`,
    noResultsHint        : 'Try removing a filter, or search for something else.',
    error                : `The ${entity.many} could not be loaded`,
    errorHint            : 'The connection dropped or the server did not answer. Your filters are kept.',
    invalidView          : 'This view cannot be shown',
    invalidViewHint      : 'A filter in the address is not valid any more.',
    count                : plural,
    range                : (from, to, total) => `${INTEGER.format(from)}–${INTEGER.format(to)} of ${INTEGER.format(total)}`,
    selected             : (count) => `${plural(count)} selected`,
    selectAll            : (count) => `Select all ${INTEGER.format(count)}`,
    allSelected          : (count, excluded) => `${plural(count)} selected${excluded ? `, all but ${INTEGER.format(excluded)}` : ''}`,
    sortedBy             : (column, direction) => `Sorted by ${column}, ${direction === 'asc' ? 'ascending' : 'descending'}`,
    sortPriority         : (position, direction) => `${position === 2 ? 'second' : `${position}th`} sort, ${direction === 'asc' ? 'ascending' : 'descending'}`,
    columnsChanged       : (count) => `${count} changed`,
    rowsError            : (from, to) => `Rows ${from}–${to} did not arrive.`
  };
}


/* --------
 * Filters
 * -------- */

const DAY_MONTH = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });

const day = (iso: string): string => DATE.format(new Date(iso));

export const filtersBarLabels: FiltersBarLabels = {
  more          : 'More filters',
  all           : 'Filters',
  clearAll      : 'Clear filters',
  back          : 'Back',
  selectAll     : 'Select all',
  clear         : 'Clear',
  search        : 'Search',
  noResults     : 'Nothing matches',
  loading       : 'Loading the values',
  clearSearch   : 'Clear the search',
  activeCount   : (count) => `· ${count}`,
  remove        : (name) => `Remove ${name}`,
  activeName    : (name) => `${name}:`,
  values        : (labels) => labels.join(', '),
  moreValues    : (count) => `+${count}`,
  restValues    : (count) => `and ${count} more`,
  date          : {
    previousMonth: 'Previous month',
    nextMonth    : 'Next month',
    chooseMonth  : 'Choose the month',
    chooseYear   : 'Choose the year',
    previousYears: 'Previous years',
    nextYears    : 'Next years',
    from         : 'From this date',
    until        : 'Until this date',
    value        : (range) => {
      if (range.from && range.to) {
        return `${DAY_MONTH.format(new Date(range.from))}–${day(range.to)}`;
      }

      return range.from ? `from ${day(range.from)}` : `until ${day(range.to ?? '')}`;
    }
  },
  remote: {
    minChars : 'Type at least 2 characters',
    searching: 'Searching…',
    results  : (count) => `${count} found`,
    noResults: (text) => `Nothing for “${text}”`,
    tooMany  : (count) => `First ${count} shown: type more to narrow the search`,
    error    : 'The search did not answer',
    retry    : 'Retry'
  }
};


/* --------
 * Selector
 * -------- */

/** The texts of a selector, for an entity named in the singular and the plural */
export function modalSelectorLabels(entity: { one: string; many: string }): ModalSelectorLabels {
  const plural = (count: number): string => `${INTEGER.format(count)} ${count === 1 ? entity.one : entity.many}`;

  return {
    close                : 'Close',
    cancel               : 'Cancel',
    caption              : `The ${entity.many}`,
    showOnlySelected     : 'Show only the chosen ones',
    onlySelected         : 'Only the chosen ones',
    removeOnlySelected   : 'Show them all',
    noValue              : 'No value',
    yes                  : 'Yes',
    no                   : 'No',
    currentNote          : 'Current',
    noResultsFilters     : `No ${entity.one} with these filters`,
    noResultsHint        : 'Try removing a filter.',
    clearFilters         : 'Clear filters',
    clearFiltersAndSearch: 'Clear filters and search',
    error                : `The ${entity.many} could not be loaded`,
    errorHint            : 'The choices made so far are kept.',
    retry                : 'Retry',
    confirmError         : 'The choice could not be saved. Try again: the rows are still chosen.',
    busySubmit           : 'Saving',
    instructions         : 'Up and down arrows move between the rows, Enter chooses, Escape empties the search and then closes.',
    keys                 : [
      { keys: [ '↑', '↓' ], label: 'rows' },
      { keys: [ 'Enter' ], label: 'choose' },
      { keys: [ 'Esc' ], label: 'close' }
    ],
    current    : (label, code) => `Current value: ${label}${code ? ` · ${code}` : ''}`,
    count      : (count, query) => (query ? `${plural(count)} for “${query}”` : plural(count)),
    more       : (limit, total) => (total === null ? `More than ${limit} ${entity.many}` : `First ${limit} of ${plural(total)}. Narrow with the search or the filters.`),
    selected   : (count) => `${plural(count)} selected`,
    selectAll  : (count) => `Select all ${INTEGER.format(count)}`,
    allSelected: (count, excluded) => `${plural(count)}${excluded ? `, all but ${INTEGER.format(excluded)}` : ''}`,
    noResults  : (query) => `No ${entity.one} for “${query}”`,
    filtersBar : filtersBarLabels
  };
}


/* --------
 * Detail
 * -------- */

export const detailLabels: DetailLabels = {
  empty     : 'Not given',
  yes       : 'Yes',
  no        : 'No',
  copy      : 'Copy',
  copied    : 'Copied',
  copyFailed: 'The copy failed',
  retry     : 'Retry'
};
