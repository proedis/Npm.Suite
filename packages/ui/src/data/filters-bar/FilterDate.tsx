'use client';

import * as React from 'react';

import { Stack } from '../../layout/Stack';

import { Button } from '../../actions/button/Button';

import { Calendar } from '../../forms/calendar/Calendar';

import { isFilterActive } from './filtersBarState';

import type { CalendarRange } from '../../forms/calendar/Calendar';

import type { DateFilter, FiltersBarLabels } from './filtersBarTypes';


/* --------
 * Types Definition
 * -------- */

export interface FilterDateProps {
  filter: DateFilter;

  /** The day of the first click, not yet a filter. Held by the caller: closing turns it into that day */
  draft: string | null;
  onDraftChange: (day: string | null) => void;

  /** A whole period, or one end open from the footer */
  onCommit: (range: CalendarRange) => void;

  /** "Clear" in the footer: in "More filters", where there is no x */
  clearable: boolean;

  labels: FiltersBarLabels;
}


/* --------
 * Helpers
 * -------- */

/** The period a closing leaves: the day of a single click, or the value as it was */
export function settleDraft(draft: string | null): CalendarRange | null {
  return draft ? { from: draft, to: draft } : null;
}


/* --------
 * Component Definition
 * -------- */

/**
 * The calendar of the DatePicker alone, without the field: the first click does not filter, the
 * second does. After one click the footer offers "From this date" and "Until this date"; closing after
 * one click filters that day, through `settleDraft` in the caller.
 */
export function FilterDate(props: FilterDateProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { clearable, draft, filter, labels, onCommit, onDraftChange } = props;


  // ----
  // Internal State
  // ----
  const [ preview, setPreview ] = React.useState<string | null>(null);


  // ----
  // Handlers
  // ----
  const handleSelect = (day: string): void => {
    if (!draft) {
      onDraftChange(day);
      return;
    }

    onDraftChange(null);
    onCommit(day < draft ? { from: day, to: draft } : { from: draft, to: day });
  };

  const commitOpen = (range: CalendarRange): void => {
    onDraftChange(null);
    onCommit(range);
  };


  // ----
  // Component Render
  // ----
  const showClear = clearable && !draft && isFilterActive(filter);

  return (
    <Stack gap={0} data-slot={'filter-date'}>
      <Calendar
        autoFocus
        locale={filter.locale}
        range={draft ? { from: draft, to: null } : filter.value}
        preview={draft ? preview : null}
        min={filter.min}
        max={filter.max}
        isDateUnavailable={filter.isDateUnavailable}
        dayMeta={filter.dayMeta}
        labels={labels.date}
        onSelect={handleSelect}
        onHoverDay={setPreview}
      />

      {(draft || showClear) && (
        <Stack
          data-slot={'filter-date-footer'}
          direction={'horizontal'}
          align={'center'}
          justify={'between'}
          gap={1}
          className={'mt-1 border-t border-border pt-1'}
        >
          {draft && (
            <React.Fragment>
              <Button size={'sm'} fill={'plain'} tone={'primary'} data-slot={'filter-date-from'} onClick={() => commitOpen({ from: draft, to: null })}>
                {labels.date.from}
              </Button>
              <Button size={'sm'} fill={'plain'} tone={'primary'} data-slot={'filter-date-until'} onClick={() => commitOpen({ from: null, to: draft })}>
                {labels.date.until}
              </Button>
            </React.Fragment>
          )}

          {showClear && (
            <Button size={'sm'} fill={'plain'} tone={'primary'} data-slot={'filter-date-clear'} className={'ms-auto'} onClick={() => commitOpen({ from: null, to: null })}>
              {labels.clear}
            </Button>
          )}
        </Stack>
      )}
    </Stack>
  );

}

FilterDate.displayName = 'FilterDate';
