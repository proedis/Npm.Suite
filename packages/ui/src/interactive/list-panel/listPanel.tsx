import * as React from 'react';

import { cn } from '../../core/cn';


/*
 * The list that opens under Select, MultiSelect and Combobox, and later under the filters of the
 * FiltersBar: one look, written once. Private to the interactive tier.
 *
 * It is classes and small presentational parts, not a component tree: Select runs on Base UI's
 * `Select` up to the search threshold and on its `Combobox` past it, because a Select cannot hold a
 * search field. Each control renders the parts of its own engine with these classes, so the two
 * engines look and measure the same.
 */


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

interface ListFieldEndProps {
  loading: boolean;
  spinner: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
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
