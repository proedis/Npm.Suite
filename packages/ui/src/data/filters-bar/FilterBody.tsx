'use client';

import * as React from 'react';

import { FilterDate } from './FilterDate';
import { FilterList } from './FilterList';

import type { FiltersBarFilter, FiltersBarLabels } from './filtersBarTypes';


/* --------
 * Types Definition
 * -------- */

export interface FilterBodyProps {
  filter: FiltersBarFilter;

  /** In the row, a single choice has its x and no footer; in "More filters" it has "Clear" */
  place: 'bar' | 'more';

  searchThreshold: number;

  /** A single choice made, a period closed: the bar closes, "More filters" goes back to the names */
  onDone: () => void;

  /** ← from the values, in "More filters" */
  onBack?: () => void;

  focusRef?: React.Ref<HTMLElement>;
  autoFocus?: boolean;

  draft: string | null;
  onDraftChange: (day: string | null) => void;

  labels: FiltersBarLabels;
}


/* --------
 * Constants Definition
 * -------- */

/** Past this many values a local list takes the wide panel of the Combobox */
const LONG_LIST = 200;

const PANEL_BASE = [
  'flex max-h-(--available-height) flex-col rounded-md bg-popover p-1 text-sm text-popover-foreground shadow-md outline-none',
  'transition-opacity duration-150 data-starting-style:opacity-0 data-ending-style:opacity-0 motion-reduce:transition-none'
].join(' ');


/* --------
 * Helpers
 * -------- */

/** The panel of a filter: 240px for a list, 320 for a server list or a long one, the calendar's own for a date */
export function filterPanelClass(filter: FiltersBarFilter | null): string {
  if (!filter) {
    return `${PANEL_BASE} w-60`;
  }

  if (filter.kind === 'date') {
    return PANEL_BASE;
  }

  if (filter.kind === 'remote' || filter.options.length > LONG_LIST) {
    return `${PANEL_BASE} w-80`;
  }

  return `${PANEL_BASE} w-60`;
}


/* --------
 * Component Definition
 * -------- */

/** The values of one filter, in its button's panel or in the second step of "More filters" */
export function FilterBody(props: FilterBodyProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { autoFocus, draft, filter, focusRef, labels, onBack, onDone, onDraftChange, place, searchThreshold } = props;


  // ----
  // Component Render
  // ----
  if (filter.kind === 'date') {
    return (
      <FilterDate
        filter={filter}
        draft={draft}
        onDraftChange={onDraftChange}
        clearable={place === 'more'}
        labels={labels}
        onCommit={(range) => {
          filter.onValueChange(range);
          onDone();
        }}
      />
    );
  }

  if (filter.kind === 'remote') {
    return (
      <FilterList
        label={filter.label}
        options={[]}
        remote={filter}
        value={filter.value}
        multiple
        footer={'clear'}
        searchThreshold={searchThreshold}
        onChange={(value, items) => filter.onValueChange(value, items)}
        onBack={onBack}
        focusRef={focusRef}
        autoFocus={autoFocus}
        labels={labels}
      />
    );
  }

  if (filter.multiple) {
    return (
      <FilterList
        label={filter.label}
        options={filter.options}
        value={filter.value}
        multiple
        footer={'actions'}
        searchThreshold={searchThreshold}
        onChange={(value) => filter.onValueChange(value)}
        onBack={onBack}
        focusRef={focusRef}
        autoFocus={autoFocus}
        labels={labels}
      />
    );
  }

  return (
    <FilterList
      label={filter.label}
      options={filter.options}
      value={filter.value === null ? [] : [ filter.value ]}
      multiple={false}
      footer={place === 'more' ? 'clear' : 'none'}
      searchThreshold={searchThreshold}
      onChange={(value) => {
        filter.onValueChange(value[0] ?? null);
        onDone();
      }}
      onBack={onBack}
      focusRef={focusRef}
      autoFocus={autoFocus}
      labels={labels}
    />
  );

}

FilterBody.displayName = 'FilterBody';
