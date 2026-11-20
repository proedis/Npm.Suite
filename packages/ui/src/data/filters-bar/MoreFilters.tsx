'use client';

import * as React from 'react';

import { Popover as PopoverPrimitive } from '@base-ui/react/popover';

import { cn } from '../../core/cn';

import { Stack } from '../../layout/Stack';

import { Spinner } from '../../primitives/Spinner';

import { Button } from '../../actions/button/Button';
import { IconButton } from '../../actions/button/IconButton';
import { LIST_ITEM, LIST_POSITIONER, LIST_SIDE_OFFSET } from '../../actions/list-panel/listPanel';
import { Tooltip } from '../../actions/tooltip/Tooltip';
import { LIST_PANEL_LAYOUT } from '../../forms/list-field/listField';

import { FilterBody, filterPanelClass } from './FilterBody';
import { filtersBarGlyph } from './filtersBarGlyphs';
import { filterValueLabels, isFilterActive } from './filtersBarState';

import type { FiltersBarFilter, FiltersBarLabels } from './filtersBarTypes';


/* --------
 * Types Definition
 * -------- */

export interface MoreFiltersProps {
  /** The filters that did not fit, in their order */
  filters: readonly FiltersBarFilter[];

  /** Every filter is in here: the button says "Filters" instead of "More filters" */
  narrow: boolean;

  open: boolean;
  onOpenChange: (open: boolean, reason?: string) => void;

  searchThreshold: number;

  triggerRef?: (element: HTMLButtonElement | null) => void;

  labels: FiltersBarLabels;
}


/* --------
 * Constants Definition
 * -------- */

const SHOWN_VALUES = 2;

const HEADER = '-mx-1 -mt-1 mb-1 h-8 shrink-0 border-b border-border ps-0.5 pe-3 font-medium';

const NAME_ROW = cn(
  LIST_ITEM,
  'w-full text-start focus-visible:bg-accent focus-visible:text-accent-foreground hover:bg-accent hover:text-accent-foreground',
  'aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:hover:bg-transparent'
);


/* --------
 * Parts
 * -------- */

/** The button of "More filters", or "Filters" in a narrow bar: with active filters inside, their colour and count */
export function moreFiltersButtonProps(narrow: boolean, active: number, labels: FiltersBarLabels): {
  fill: 'plain' | 'soft';
  tone: 'secondary' | 'primary';
  children: React.ReactNode;
} {
  return {
    fill    : active > 0 ? 'soft' : 'plain',
    tone    : active > 0 ? 'primary' : 'secondary',
    children: (
      <React.Fragment>
        {narrow ? labels.all : labels.more}
        {active > 0 && <span className={'font-normal'}>{labels.activeCount(active)}</span>}
      </React.Fragment>
    )
  };
}


/* --------
 * Component Definition
 * -------- */

/**
 * "More filters": the filters that do not fit in the row, in two steps of one panel. First the names,
 * each with the values already chosen; then the values of the one chosen, under a header that goes
 * back. Enter and → go into the values, ← (with an empty search) and Esc come back; Esc on the names
 * closes. No x in here: a single choice has "Clear" in its footer too.
 *
 * On Base UI's `Popover` with the look of the list panel: a submenu of Base UI would open beside it.
 */
export function MoreFilters(props: MoreFiltersProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { filters, labels, narrow, onOpenChange, open, searchThreshold, triggerRef } = props;


  // ----
  // Internal Hooks
  // ----
  const firstRowRef = React.useRef<HTMLButtonElement | null>(null);
  const rowsRef = React.useRef<HTMLDivElement>(null);


  // ----
  // Internal State
  // ----
  const [ step, setStep ] = React.useState<string | null>(null);
  const [ returnTo, setReturnTo ] = React.useState<string | null>(null);
  const [ draft, setDraft ] = React.useState<string | null>(null);

  const current = filters.find((filter) => filter.id === step) ?? null;
  const active = filters.filter(isFilterActive).length;


  // ----
  // Handlers
  // ----

  /** A single click on a calendar left behind: that day */
  const settle = (): void => {
    if (current?.kind === 'date' && draft) {
      current.onValueChange({ from: draft, to: draft });
    }

    setDraft(null);
  };

  const back = (): void => {
    settle();
    setReturnTo(step);
    setStep(null);
  };

  const handleOpenChange = (next: boolean, details: PopoverPrimitive.Root.ChangeEventDetails): void => {
    /* Esc on the values goes back to the names */
    if (!next && step !== null && details.reason === 'escape-key') {
      details.cancel();
      back();
      return;
    }

    if (!next) {
      settle();
      setStep(null);
      setReturnTo(null);
    }

    onOpenChange(next, details.reason);
  };

  const enter = (filter: FiltersBarFilter): void => {
    if (filter.loading || (filter.disabled && !isFilterActive(filter))) {
      return;
    }

    setStep(filter.id);
  };

  const handleRowsKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    const rows = Array.from(rowsRef.current?.querySelectorAll<HTMLButtonElement>('[data-slot=more-filters-row]') ?? []);
    const index = rows.indexOf(document.activeElement as HTMLButtonElement);
    let next = -1;

    switch (event.key) {
      case 'ArrowDown':
        next = Math.min(rows.length - 1, index + 1);
        break;
      case 'ArrowUp':
        next = Math.max(0, index - 1);
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = rows.length - 1;
        break;
      case 'ArrowRight': {
        const filter = filters[index];

        if (filter) {
          event.preventDefault();
          enter(filter);
        }

        return;
      }
      default:
        return;
    }

    event.preventDefault();
    rows[next]?.focus();
  };


  // ----
  // Lifecycle Events
  // ----

  /* Back from the values: the focus goes to the name it came from */
  React.useEffect(() => {
    if (step === null && returnTo !== null) {
      rowsRef.current?.querySelector<HTMLElement>(`[data-filter-id="${CSS.escape(returnTo)}"]`)?.focus();
    }
  }, [ step, returnTo ]);


  // ----
  // Component Render
  // ----
  const buttonFace = moreFiltersButtonProps(narrow, active, labels);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange} modal={false}>
      <PopoverPrimitive.Trigger
        render={(
          <Button
            ref={triggerRef}
            size={'sm'}
            fill={buttonFace.fill}
            tone={buttonFace.tone}
            leading={filtersBarGlyph('filter')}
            data-slot={'more-filters'}
            data-narrow={narrow || undefined}
            data-active={active > 0 || undefined}
            data-open={open || undefined}
          >
            {buttonFace.children}
          </Button>
        )}
      />

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner side={'bottom'} align={'start'} sideOffset={LIST_SIDE_OFFSET} className={LIST_POSITIONER}>
          <PopoverPrimitive.Popup
            aria-label={narrow ? labels.all : labels.more}
            initialFocus={firstRowRef}
            data-slot={'more-filters-panel'}
            data-step={current ? 'values' : 'names'}
            render={LIST_PANEL_LAYOUT}
            className={filterPanelClass(current)}
          >
            {current
              ? (
                <React.Fragment>
                  <Stack data-slot={'more-filters-header'} direction={'horizontal'} align={'center'} gap={1} className={HEADER}>
                    <IconButton
                      label={labels.back}
                      icon={filtersBarGlyph('back')}
                      size={'sm'}
                      data-slot={'more-filters-back'}
                      onClick={back}
                      className={'size-6'}
                    />
                    <span data-slot={'more-filters-title'} className={'truncate'}>{current.label}</span>
                  </Stack>

                  <FilterBody
                    key={current.id}
                    filter={current}
                    place={'more'}
                    searchThreshold={searchThreshold}
                    autoFocus
                    draft={draft}
                    onDraftChange={setDraft}
                    onBack={back}
                    onDone={back}
                    labels={labels}
                  />
                </React.Fragment>
              )
              : (
                <Stack ref={rowsRef} data-slot={'more-filters-names'} onKeyDown={handleRowsKeyDown}>
                  {filters.map((filter, index) => {
                    const values = filterValueLabels(filter, labels);
                    const off = (filter.disabled ?? false) && values.length === 0;
                    const rest = values.length - SHOWN_VALUES;

                    const row = (
                      <Stack
                        as={'button'}
                        key={filter.id}
                        ref={index === 0 ? firstRowRef : undefined}
                        type={'button'}
                        data-slot={'more-filters-row'}
                        data-filter-id={filter.id}
                        data-active={values.length > 0 || undefined}
                        data-disabled={off || undefined}
                        data-loading={filter.loading || undefined}
                        aria-disabled={off || filter.loading || undefined}
                        aria-busy={filter.loading || undefined}
                        direction={'horizontal'}
                        align={'start'}
                        gap={2}
                        className={NAME_ROW}
                        onClick={() => enter(filter)}
                      >
                        <Stack as={'span'} data-slot={'more-filters-row-text'} className={'min-w-0 flex-1'}>
                          <span data-slot={'more-filters-row-label'}>{filter.label}</span>
                          {values.length > 0 && (
                            <Stack
                              as={'span'}
                              data-slot={'more-filters-row-values'}
                              direction={'horizontal'}
                              gap={1}
                              className={'min-w-0 text-xs text-muted-foreground'}
                            >
                              <span className={'truncate'}>{labels.values(values.slice(0, SHOWN_VALUES))}</span>
                              {rest > 0 && <span className={'flex-none'}>{labels.moreValues(rest)}</span>}
                            </Stack>
                          )}
                        </Stack>
                        <Stack
                          as={'span'}
                          data-slot={'more-filters-row-end'}
                          inline
                          direction={'horizontal'}
                          className={'mt-0.5 shrink-0 text-muted-foreground [&_svg]:size-4'}
                        >
                          {filter.loading ? <Spinner size={'sm'} className={'size-3.5'} label={labels.loading} /> : filtersBarGlyph('next')}
                        </Stack>
                      </Stack>
                    );

                    return off && filter.disabledReason
                      ? <Tooltip key={filter.id} content={filter.disabledReason} side={'right'}>{row}</Tooltip>
                      : row;
                  })}
                </Stack>
              )}
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );

}

MoreFilters.displayName = 'MoreFilters';
