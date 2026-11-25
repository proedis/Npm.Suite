import * as React from 'react';

import { cn } from '../../core/cn';

import { Stack } from '../../layout/Stack';


/*
 * The list that opens under Select, MultiSelect and Combobox, under the filters of the FiltersBar,
 * and the panel of Menu: one look, written once. Private to the package: `actions` holds it because
 * Menu and Tabs use it, and nothing here knows what a form is.
 *
 * It is classes and small presentational parts, not a component tree: Select runs on Base UI's
 * `Select` up to the search threshold and on its `Combobox` past it, because a Select cannot hold a
 * search field. Each control renders the parts of its own engine with these classes, so the two
 * engines look and measure the same.
 *
 * The parts that do know (the chips, the "Retry" item, the messages of a list fed by a server, the
 * press on the frame) live in `forms/list-field`.
 */


/* --------
 * Types Definition
 * -------- */

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

/* --------
 * Constants Definition
 * -------- */

/** The positioner: above a dialog, 4px under the field, flipping above when there is no room */
export const LIST_POSITIONER = 'z-popover outline-none';

export const LIST_SIDE_OFFSET = 4;

/** The panel: as wide as the field, never under 160px, never taller than the room there is. A column, through Stack */
export const LIST_PANEL = [
  'max-h-(--available-height) w-(--anchor-width) min-w-40',
  'rounded-list-panel bg-popover p-1 text-sm text-popover-foreground shadow-md outline-none',
  'transition-opacity duration-150 data-starting-style:opacity-0 data-ending-style:opacity-0',
  'motion-reduce:transition-none'
].join(' ');

/** The area of the items: eight and a half rows, so the cut one says the list scrolls */
export const LIST_ITEMS = 'max-h-68 overflow-y-auto scrollbar-thin outline-none';

/**
 * An item: at least 32px, wraps rather than truncating, the tick on its first line. Active with the
 * pointer or the keyboard, the same surface; disabled at half, skipped by the arrows. A row aligned at
 * the top with a gap of 2, through Stack.
 */
export const LIST_ITEM = [
  'relative min-h-8 cursor-pointer rounded-list-item px-2 py-1.5 outline-none select-none',
  'data-highlighted:bg-accent data-highlighted:text-accent-foreground',
  'data-disabled:cursor-not-allowed data-disabled:opacity-50'
].join(' ');

/** The search row at the top of a panel: 32px, a rule under it, out of the scrolling area. A centred row with a gap of 2 */
export const LIST_SEARCH = [
  '-mx-1 -mt-1 mb-1 h-8 shrink-0 border-b border-border px-3',
  '[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground'
].join(' ');

export const LIST_SEARCH_INPUT = 'h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground';

/** A line of text in the panel: no results, the hint, a status. Never an empty list */
export const LIST_MESSAGE = 'px-2 py-1.5 text-muted-foreground';

/** The footer of actions: a rule above it, out of the scrolling area. A centred row, its ends apart, with a gap of 1 */
export const LIST_FOOTER = '-mx-1 -mb-1 mt-1 h-9 shrink-0 border-t border-border px-0.5';

/** The box of an option of a multiple list, filled with `primary` when the option is chosen. Inline, its mark centred */
export const LIST_OPTION_BOX = [
  'mt-0.5 size-4 shrink-0 rounded-sm border border-input bg-card text-primary-foreground',
  'group-data-selected/option:border-transparent group-data-selected/option:bg-primary'
].join(' ');

/** A chosen value inside a multiple field. An inline row, centred, with a gap of 0.5 */
export const LIST_CHIP = 'h-5 max-w-full shrink-0 rounded-sm bg-secondary ps-1.5 text-xs font-medium text-secondary-foreground';

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


/* --------
 * Parts
 * -------- */

/** The content of the tooltip of a "+N": the first values one per line, then how many more */
export function OverflowTooltipList(props: OverflowTooltipListProps): React.ReactNode {
  const { rest, values } = props;

  return (
    <Stack gap={0} as={'span'} data-slot={'list-overflow-values'}>
      {values.slice(0, TOOLTIP_LIST_LIMIT).map((value, index) => <span key={index}>{value}</span>)}
      {rest && values.length > TOOLTIP_LIST_LIMIT && (
        <span className={'text-tooltip-muted-foreground'}>{rest(values.length - TOOLTIP_LIST_LIMIT)}</span>
      )}
    </Stack>
  );
}


/** The end of a list field: what comes before the arrow (a clear button), then the arrow or the spinner */
export function ListFieldEnd(props: ListFieldEndProps): React.ReactNode {
  return (
    <Stack
      as={'span'}
      data-slot={'list-field-end'}
      direction={'horizontal'}
      align={'center'}
      gap={1}
      className={cn('shrink-0', props.className)}
    >
      {props.children}
      {props.loading ? props.spinner : <ChevronGlyph />}
    </Stack>
  );
}
