import * as React from 'react';

import { cn } from '../../core/cn';

import { VisuallyHidden } from '../../primitives/VisuallyHidden';

import { IconButton } from '../button/IconButton';
import { ErrorGlyph } from '../../forms/field/glyphs';
import { ClearGlyph } from '../../forms/text-input/glyphs';
import { Tooltip } from '../tooltip/Tooltip';

import type { ComboboxItem } from '../../forms/combobox/comboboxTypes';


/*
 * The list that opens under Select, MultiSelect and Combobox, and later under the filters of the
 * FiltersBar: one look, written once. Private to the interactive tier.
 *
 * It is classes and small presentational parts, not a component tree: Select runs on Base UI's
 * `Select` up to the search threshold and on its `Combobox` past it, because a Select cannot hold a
 * search field. Each control renders the parts of its own engine with these classes, so the two
 * engines look and measure the same.
 *
 * What the controls also share lives here, each piece once: the chips of a multiple field and their
 * "+N", the list of hidden values in a tooltip, the messages and the status of a list fed by a
 * server, the press on the frame that opens the list, and the "Retry" item.
 */


/* --------
 * Types Definition
 * -------- */

/** The labels of a list fed by a server, as Combobox and the remote filter of FiltersBar both declare them */
export interface RemoteListLabels {
  readonly minChars: string;
  readonly searching: string;
  readonly error: string;
  readonly results: (count: number) => string;
  readonly noResults: (text: string) => string;
  readonly tooMany: (count: number) => string;
}

export interface RemoteListState {
  /** The text typed, trimmed */
  term: string;

  /** Fewer characters than a search needs: nothing is asked */
  underMin: boolean;

  /** A search is on its way */
  searching: boolean;

  /** The wait has lasted long enough to be shown */
  busyVisible: boolean;

  /** The search failed, and none is on its way */
  failed: boolean;

  /** How many results the server answered */
  count: number;

  /** Whether the list shows nothing: it may differ from `count`, a list can leave out what is chosen */
  empty: boolean;

  /** The server had more than it sent */
  hasMore: boolean;
}

interface ListFieldEndProps {
  loading: boolean;
  spinner: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

interface OverflowTooltipListProps {
  /** The values hidden, by name */
  values: readonly React.ReactNode[];

  /** The closing line past `TOOLTIP_LIST_LIMIT`; without it the list stops at the limit in silence */
  rest?: (count: number) => string;
}

interface ListChipsProps {
  /** The prefix of the slots: `<slot>-chips`, `<slot>-chip`, `<slot>-chip-remove`, `<slot>-more` */
  slot: string;

  /** The values chosen, in order */
  items: readonly ComboboxItem[];

  /** Chips shown at most, the rest in "+N". Read only shows them all, wrapping */
  maxChips: number;

  readOnly: boolean;

  /** Read only or disabled: no chip has its x */
  inert: boolean;

  /** A value the x cannot take away, which then has none */
  isLocked?: (item: ComboboxItem) => boolean;

  /** Shown when nothing is chosen */
  placeholder?: React.ReactNode;

  labels: {
    readonly remove: (label: string) => string;
    readonly more: (count: number) => string;
    readonly moreRest: (count: number) => string;
  };

  onRemove: (item: ComboboxItem) => void;
}


/* --------
 * Constants Definition
 * -------- */

/** The positioner: above a dialog, 4px under the field, flipping above when there is no room */
export const LIST_POSITIONER = 'z-popover outline-none';

export const LIST_SIDE_OFFSET = 4;

/** The panel: as wide as the field, never under 160px, never taller than the room there is */
export const LIST_PANEL = [
  'flex max-h-(--available-height) w-(--anchor-width) min-w-40 flex-col',
  'rounded-md bg-popover p-1 text-sm text-popover-foreground shadow-md outline-none',
  'transition-opacity duration-150 data-starting-style:opacity-0 data-ending-style:opacity-0',
  'motion-reduce:transition-none'
].join(' ');

/** The area of the items: eight and a half rows, so the cut one says the list scrolls */
export const LIST_ITEMS = 'max-h-68 overflow-y-auto scrollbar-thin outline-none';

/**
 * An item: at least 32px, wraps rather than truncating, the tick on its first line. Active with the
 * pointer or the keyboard, the same surface; disabled at half, skipped by the arrows.
 */
export const LIST_ITEM = [
  'relative flex min-h-8 cursor-default items-start gap-2 rounded-sm px-2 py-1.5 outline-none select-none',
  'data-highlighted:bg-accent data-highlighted:text-accent-foreground',
  'data-disabled:opacity-50'
].join(' ');

/** The search row at the top of a panel: 32px, a rule under it, out of the scrolling area */
export const LIST_SEARCH = [
  '-mx-1 -mt-1 mb-1 flex h-8 shrink-0 items-center gap-2 border-b border-border px-3',
  '[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground'
].join(' ');

export const LIST_SEARCH_INPUT = 'h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground';

/** A line of text in the panel: no results, the hint, a status. Never an empty list */
export const LIST_MESSAGE = 'px-2 py-1.5 text-muted-foreground';

/** The footer of actions: a rule above it, out of the scrolling area */
export const LIST_FOOTER = '-mx-1 -mb-1 mt-1 flex h-9 shrink-0 items-center justify-between gap-1 border-t border-border px-0.5';

/** The box of an option of a multiple list, filled with `primary` when the option is chosen */
export const LIST_OPTION_BOX = [
  'mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-sm border border-input bg-card text-primary-foreground',
  'group-data-selected/option:border-transparent group-data-selected/option:bg-primary'
].join(' ');

/** A chosen value inside a multiple field */
export const LIST_CHIP = 'inline-flex h-5 max-w-full shrink-0 items-center gap-0.5 rounded-sm bg-secondary ps-1.5 text-xs font-medium text-secondary-foreground';

/**
 * The one item a list fed by a server offers after a failed search. Compared by identity, so it is
 * this object and no other; the value cannot collide with a key coming from the server
 */
export const LIST_RETRY: ComboboxItem = { value: '\u0000retry', label: '' };

/** Values listed by name in a tooltip, at most; past it, one line says how many more */
export const TOOLTIP_LIST_LIMIT = 10;


/* --------
 * Glyphs
 * -------- */

/** The arrow at the end of a list field, turned while the list is open */
export function ChevronGlyph(): React.ReactNode {
  return (
    <svg
      data-slot={'list-chevron'}
      viewBox={'0 0 24 24'}
      fill={'none'}
      stroke={'currentColor'}
      strokeWidth={2}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
      aria-hidden={'true'}
      focusable={'false'}
      className={'transition-transform duration-150 group-has-[[data-popup-open]]/list-field:rotate-180 motion-reduce:transition-none'}
    >
      <path d={'M6 9l6 6 6-6'} />
    </svg>
  );
}


/* --------
 * Helpers
 * -------- */

/** Matching a search: ignores case and accents, keeps the order of the list */
export function normalizeForSearch(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase();
}


export function matchesSearch(label: string, query: string): boolean {
  return normalizeForSearch(label).includes(normalizeForSearch(query.trim()));
}


/**
 * The press on the frame of a list field, the arrow and the room around the value: it opens or
 * closes the list and puts the focus on the trigger. `skip` names what handles its own press, the
 * trigger itself and the buttons inside the frame
 */
export function toggleFromFrame(
  event: React.MouseEvent<HTMLElement>,
  skip: string,
  trigger: HTMLElement | null,
  open: boolean,
  onOpenChange: (open: boolean) => void
): void {
  if ((event.target as Element).closest(skip) !== null) {
    return;
  }

  event.preventDefault();
  trigger?.focus();
  onOpenChange(!open);
}


/* --------
 * Parts
 * -------- */

/** The error line of a list, with its mark */
export function ListError(props: { children: React.ReactNode }): React.ReactNode {
  return (
    <span className={'flex items-start gap-1 text-destructive'}>
      <ErrorGlyph />
      {props.children}
    </span>
  );
}


/** The content of the tooltip of a "+N": the first values one per line, then how many more */
export function OverflowTooltipList(props: OverflowTooltipListProps): React.ReactNode {
  const { rest, values } = props;

  return (
    <span className={'flex flex-col'}>
      {values.slice(0, TOOLTIP_LIST_LIMIT).map((value, index) => <span key={index}>{value}</span>)}
      {rest && values.length > TOOLTIP_LIST_LIMIT && (
        <span className={'text-tooltip-muted-foreground'}>{rest(values.length - TOOLTIP_LIST_LIMIT)}</span>
      )}
    </span>
  );
}


/**
 * The values of a multiple field as chips: each with its label, truncated with a tooltip when two or
 * more share the room, and an x that does not take the focus. Past `maxChips` one "+N" chip names
 * the rest in its tooltip. Above the trigger that fills the frame, so only the chips take the pointer.
 */
export function ListChips(props: ListChipsProps): React.ReactNode {
  const { inert, isLocked, items, labels, maxChips, onRemove, placeholder, readOnly, slot } = props;

  const shown = readOnly ? items : items.slice(0, maxChips);
  const hidden = readOnly ? [] : items.slice(maxChips);

  return (
    <span
      data-slot={`${slot}-chips`}
      className={cn(
        'pointer-events-none relative z-10 flex min-w-0 flex-1 items-center gap-1.5 *:pointer-events-auto',
        readOnly ? 'flex-wrap py-1' : 'overflow-hidden'
      )}
    >
      {items.length === 0 && placeholder && <span className={'truncate text-placeholder'}>{placeholder}</span>}

      {shown.map((item) => {
        const locked = isLocked?.(item) ?? false;

        return (
          <span
            key={item.value}
            data-slot={`${slot}-chip`}
            className={cn(LIST_CHIP, (inert || locked) && 'pe-1.5', readOnly && 'border border-border bg-card')}
          >
            <Tooltip content={item.label} truncatedOnly align={'start'}>
              <span data-truncate={''} className={cn('min-w-0 truncate', shown.length > 1 && 'max-w-30')}>{item.label}</span>
            </Tooltip>

            {!inert && !locked && (
              <IconButton
                label={labels.remove(item.label)}
                icon={<ClearGlyph />}
                tabIndex={-1}
                size={'sm'}
                data-slot={`${slot}-chip-remove`}
                className={'size-5 rounded-sm [&_svg]:size-3.5'}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onRemove(item)}
              />
            )}
          </span>
        );
      })}

      {hidden.length > 0 && (
        <Tooltip content={<OverflowTooltipList values={hidden.map((item) => item.label)} rest={labels.moreRest} />}>
          <span data-slot={`${slot}-more`} className={cn(LIST_CHIP, 'pe-1.5')}>
            <span aria-hidden={'true'}>{`+${hidden.length}`}</span>
            <VisuallyHidden>{labels.more(hidden.length)}</VisuallyHidden>
          </span>
        </Tooltip>
      )}
    </span>
  );
}

/** The end of a list field: what comes before the arrow (a clear button), then the arrow or the spinner */
export function ListFieldEnd(props: ListFieldEndProps): React.ReactNode {
  return (
    <span data-slot={'list-field-end'} className={cn('flex shrink-0 items-center gap-1', props.className)}>
      {props.children}
      {props.loading ? props.spinner : <ChevronGlyph />}
    </span>
  );
}


/* --------
 * List States
 * -------- */

/**
 * What a list fed by a server says, in two places: the line shown in the panel, and the text of the
 * `status` region read after each answer. In order, the panel says: type more, the error, the wait,
 * nothing found. The region speaks only of an answer that arrived.
 */
export function remoteListMessages(
  state: RemoteListState,
  labels: RemoteListLabels
): { message: React.ReactNode; status: string } {
  const { busyVisible, count, empty, failed, hasMore, searching, term, underMin } = state;

  let message: React.ReactNode = null;

  if (underMin) {
    message = labels.minChars;
  }
  else if (failed) {
    message = <ListError>{labels.error}</ListError>;
  }
  else if (busyVisible) {
    message = labels.searching;
  }
  else if (!searching && empty) {
    message = labels.noResults(term);
  }

  let status = '';

  if (!underMin && !searching) {
    if (failed) {
      status = labels.error;
    }
    else if (count === 0) {
      status = labels.noResults(term);
    }
    else {
      status = hasMore ? labels.tooMany(count) : labels.results(count);
    }
  }

  return { message, status };
}
