import type { CalendarRange } from '../calendar/Calendar';

import type { FiltersBarFilter, FiltersBarLabels } from './filtersBarTypes';


/* --------
 * Values
 * -------- */

export const EMPTY_RANGE: CalendarRange = { from: null, to: null };

/** Whether a filter narrows the rows */
export function isFilterActive(filter: FiltersBarFilter): boolean {
  if (filter.kind === 'date') {
    return filter.value.from !== null || filter.value.to !== null;
  }

  if (filter.kind === 'remote' || filter.multiple) {
    return filter.value.length > 0;
  }

  return filter.value !== null;
}

/** The names of the values, in the order of the list: on a server list, from `selectedItems` */
export function filterValueLabels(filter: FiltersBarFilter, labels: FiltersBarLabels): string[] {
  if (filter.kind === 'date') {
    return isFilterActive(filter) ? [ labels.date.value(filter.value) ] : [];
  }

  if (filter.kind === 'remote') {
    return filter.value.map((key) => filter.selectedItems.find((item) => item.value === key)?.label ?? key);
  }

  if (filter.multiple) {
    return filter.options.filter((option) => filter.value.includes(option.value)).map((option) => option.label);
  }

  if (filter.value === null) {
    return [];
  }

  return [ filter.options.find((option) => option.value === filter.value)?.label ?? filter.value ];
}

/** Takes the filter off, whatever its kind */
export function clearFilter(filter: FiltersBarFilter): void {
  if (filter.kind === 'date') {
    filter.onValueChange(EMPTY_RANGE);
    return;
  }

  if (filter.kind === 'remote') {
    filter.onValueChange([], []);
    return;
  }

  if (filter.multiple) {
    filter.onValueChange([]);
    return;
  }

  filter.onValueChange(null);
}


/* --------
 * Layout
 * -------- */

/** An active filter at the edge of the row keeps at least this much of its values before it moves */
export const MIN_VALUES_WIDTH = 64;

export interface FilterMeasure {
  /** The whole button, the x of an active one included */
  readonly width: number;

  /** The values of an active one, the part that can shrink */
  readonly values: number;

  readonly active: boolean;
}

export interface FilterFitInput {
  readonly filters: readonly FilterMeasure[];

  /** The room for the filters, "More filters" and "Clear filters": the bar less the search */
  readonly available: number;

  readonly gap: number;

  /** "More filters" with its count */
  readonly more: number;

  /** "Clear filters", when a filter is active */
  readonly clear: number;
}

export interface FilterFit {
  /** How many filters stay in the row: the first ones, in their order. The others go into "More filters" */
  readonly visible: number;

  /** The width the values of the last one in the row are cut to, when it is active and fits only cut */
  readonly squeeze: number | null;

  /** Not even the first one fits: every filter goes into one "Filters" button */
  readonly narrow: boolean;
}

/**
 * Which filters fit in the row, as a pure function of the measures. The buttons never shrink: the ones
 * that do not fit go into "More filters", the last ones first. An active one at the edge cuts its
 * values before it moves; when not even the first fits, all of them go into "Filters".
 */
export function fitFilters(input: FilterFitInput): FilterFit {
  const { available, clear, filters, gap, more } = input;
  const count = filters.length;
  const clearRoom = filters.some((filter) => filter.active) ? clear + gap : 0;
  const all = filters.reduce((sum, filter, index) => sum + filter.width + (index > 0 ? gap : 0), 0);

  if (count === 0 || all + clearRoom <= available) {
    return { visible: count, squeeze: null, narrow: false };
  }

  const room = available - clearRoom - more - gap;
  let used = 0;
  let visible = 0;

  while (visible < count) {
    const cost = filters[visible]!.width + (visible > 0 ? gap : 0);

    if (used + cost > room) {
      break;
    }

    used += cost;
    visible += 1;
  }

  const edge = filters[visible];
  let squeeze: number | null = null;

  if (edge?.active) {
    const over = used + edge.width + (visible > 0 ? gap : 0) - room;
    const cut = edge.values - over;

    if (cut >= MIN_VALUES_WIDTH) {
      squeeze = Math.floor(cut);
      visible += 1;
    }
  }

  return { visible, squeeze, narrow: visible === 0 };
}

export function sameFit(a: FilterFit, b: FilterFit): boolean {
  return a.visible === b.visible && a.squeeze === b.squeeze && a.narrow === b.narrow;
}
