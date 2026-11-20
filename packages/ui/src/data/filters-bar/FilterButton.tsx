'use client';

import * as React from 'react';

import { Popover as PopoverPrimitive } from '@base-ui/react/popover';

import { cn } from '../../core/cn';

import { Stack } from '../../layout/Stack';

import { Spinner } from '../../primitives/Spinner';

import { ClearGlyph } from '../../internal/glyphs';

import { Button } from '../../actions/button/Button';
import { IconButton } from '../../actions/button/IconButton';
import { LIST_POSITIONER, LIST_SIDE_OFFSET, ListFieldEnd, OverflowTooltipList } from '../../actions/list-panel/listPanel';
import { Tooltip } from '../../actions/tooltip/Tooltip';

import { LIST_PANEL_LAYOUT } from '../../forms/list-field/listField';

import { FilterBody, filterPanelClass } from './FilterBody';
import { clearFilter, filterValueLabels, isFilterActive } from './filtersBarState';

import type { FiltersBarFilter, FiltersBarLabels } from './filtersBarTypes';


/* --------
 * Types Definition
 * -------- */

export interface FilterButtonProps {
  filter: FiltersBarFilter;

  open: boolean;

  /** With the reason of a closing: a press outside keeps the focus where it went */
  onOpenChange: (open: boolean, reason?: string) => void;

  /** The width the values are cut to, at the edge of the row */
  squeeze: number | null;

  searchThreshold: number;

  /** The button that opens the list, for the focus after "Clear filters" */
  triggerRef?: (element: HTMLButtonElement | null) => void;

  labels: FiltersBarLabels;
}

interface FilterFaceProps {
  filter: FiltersBarFilter;
  squeeze: number | null;
  labels: FiltersBarLabels;
}


/* --------
 * Constants Definition
 * -------- */

/** Values shown before "+N" */
const SHOWN_VALUES = 2;

/** Inside an active filter the focus is a 2px outline within the button: a halo would cover the other half */
const INNER_FOCUS = 'focus-visible:-outline-offset-2 focus-visible:ring-0';


/* --------
 * Parts
 * -------- */

/** What the button says: the name and the arrow, or "Name: values +N" */
export function filterFace(props: FilterFaceProps): { active: boolean; values: string[]; content: React.ReactNode } {
  const { filter, labels, squeeze } = props;
  const active = isFilterActive(filter);
  const values = filterValueLabels(filter, labels);

  if (!active) {
    return { active, values, content: filter.label };
  }

  const rest = values.length - SHOWN_VALUES;

  return {
    active,
    values,
    content: (
      <React.Fragment>
        <span className={'shrink-0'}>{labels.activeName(filter.label)}</span>
        <span
          data-truncate={''}
          data-slot={'filter-values'}
          className={cn('min-w-0 truncate font-normal', squeeze === null && 'max-w-60')}
          style={squeeze === null ? undefined : { maxWidth: squeeze }}
        >
          {labels.values(values.slice(0, SHOWN_VALUES))}
        </span>
        {rest > 0 && <span className={'flex-none font-normal'}>{labels.moreValues(rest)}</span>}
      </React.Fragment>
    )
  };
}

/** The look of the button in the hidden copy that measures the row: same classes, no behaviour */
export function FilterButtonCopy(props: FilterFaceProps): React.ReactNode {
  const face = filterFace(props);

  return (
    <Stack
      as={'span'}
      data-slot={'filters-bar-measure-filter'}
      data-filter-copy={''}
      data-active={face.active || undefined}
      inline
      direction={'horizontal'}
      className={'shrink-0'}
    >
      {face.active
        ? (
          <React.Fragment>
            <Button tabIndex={-1} size={'sm'} fill={'soft'} tone={'primary'} className={'rounded-e-none pe-1.5'}>{face.content}</Button>
            <span className={'w-6 shrink-0'} />
          </React.Fragment>
        )
        : (
          <Button tabIndex={-1} size={'sm'} fill={'solid'} tone={'secondary'} trailing={<ListFieldEnd loading={false} spinner={null} />}>
            {face.content}
          </Button>
        )}
    </Stack>
  );
}


/* --------
 * Component Definition
 * -------- */

/**
 * A filter of the row. Off, a `solid secondary` button with the name and the arrow. Active, two real
 * buttons side by side on `primary-soft`: the first says "Name: values +N" and opens the list, the
 * x takes the filter off without opening it and gives the focus back to the first.
 *
 * The values are the first two in the order of the list, cut at 240px; "+N" stays out of the cut, and
 * the tooltip lists them all. Disabled at half and still reachable, with the reason in the tooltip;
 * loading, a spinner in place of the arrow. ↓ and ↑ open the list too.
 */
export function FilterButton(props: FilterButtonProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { filter, labels, onOpenChange, open, searchThreshold, squeeze, triggerRef } = props;


  // ----
  // Internal Hooks
  // ----
  const groupRef = React.useRef<HTMLSpanElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);
  const focusRef = React.useRef<HTMLElement | null>(null);


  // ----
  // Internal State
  // ----
  const [ draft, setDraft ] = React.useState<string | null>(null);

  const face = filterFace({ filter, labels, squeeze });
  const loading = filter.loading ?? false;

  /* Never disabled with a value: the value would be stuck */
  const disabled = (filter.disabled ?? false) && !face.active;


  // ----
  // Handlers
  // ----
  const setButton = (element: HTMLButtonElement | null): void => {
    buttonRef.current = element;
    triggerRef?.(element);
  };

  const handleOpenChange = (next: boolean, details?: PopoverPrimitive.Root.ChangeEventDetails): void => {
    if (next && (disabled || loading)) {
      return;
    }

    /* A single click on the calendar, then closed: that day */
    if (!next && filter.kind === 'date' && draft) {
      filter.onValueChange({ from: draft, to: draft });
      setDraft(null);
    }

    onOpenChange(next, details?.reason);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>): void => {
    if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && !open) {
      event.preventDefault();
      handleOpenChange(true);
    }
  };

  const handleRemove = (): void => {
    clearFilter(filter);
    buttonRef.current?.focus();
  };


  // ----
  // Component Render
  // ----
  let tooltip: React.ReactNode = null;
  let truncatedOnly = false;

  if (disabled) {
    tooltip = filter.disabledReason;
  }
  else if (face.active) {
    tooltip = <OverflowTooltipList values={face.values} rest={labels.restValues} />;
    truncatedOnly = face.values.length <= SHOWN_VALUES;
  }

  const trigger = (
    <Button
      ref={setButton}
      size={'sm'}
      fill={face.active ? 'soft' : 'solid'}
      tone={face.active ? 'primary' : 'secondary'}
      disabled={disabled}
      focusableWhenDisabled
      data-slot={'filter-trigger'}
      trailing={face.active ? undefined : (
        <ListFieldEnd loading={loading} spinner={<Spinner size={'sm'} className={'size-3.5'} label={labels.loading} />} />
      )}
      className={cn(face.active && [ 'rounded-e-none pe-1.5', INNER_FOCUS ])}
      onKeyDown={handleKeyDown}
    >
      {face.content}
    </Button>
  );

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange} modal={false}>
      <Stack
        as={'span'}
        ref={groupRef}
        data-slot={'filter'}
        data-filter-id={filter.id}
        data-kind={filter.kind ?? 'list'}
        data-active={face.active || undefined}
        data-open={open || undefined}
        data-disabled={disabled || undefined}
        data-loading={loading || undefined}
        inline
        direction={'horizontal'}
        align={'center'}
        className={'group/list-field min-w-0 shrink-0'}
      >
        <Tooltip content={tooltip ?? filter.label} disabled={tooltip === null} truncatedOnly={truncatedOnly} align={'start'}>
          <PopoverPrimitive.Trigger render={trigger} />
        </Tooltip>

        {face.active && (
          <IconButton
            label={labels.remove(filter.label)}
            icon={<ClearGlyph />}
            size={'sm'}
            fill={'soft'}
            tone={'primary'}
            data-slot={'filter-remove'}
            className={cn('w-6 rounded-s-none', INNER_FOCUS)}
            onClick={handleRemove}
          />
        )}
      </Stack>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner
          anchor={groupRef}
          side={'bottom'}
          align={'start'}
          sideOffset={LIST_SIDE_OFFSET}
          className={LIST_POSITIONER}
        >
          <PopoverPrimitive.Popup
            aria-label={filter.label}
            initialFocus={filter.kind === 'date' ? false : focusRef}
            data-slot={'filter-panel'}
            render={LIST_PANEL_LAYOUT}
            className={filterPanelClass(filter)}
          >
            <FilterBody
              filter={filter}
              place={'bar'}
              searchThreshold={searchThreshold}
              focusRef={focusRef}
              draft={draft}
              onDraftChange={setDraft}
              onDone={() => onOpenChange(false)}
              labels={labels}
            />
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );

}

FilterButton.displayName = 'FilterButton';
