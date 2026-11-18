'use client';

import * as React from 'react';

import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';

import { cn } from '../../core/cn';

import type { TableColumn } from './tableTypes';


/*
 * The pieces the Table shares with the ModalSelector: the classes of rows, cells and header, the
 * placeholders of a first load, the shades of a scroller, the one tooltip of the truncated cells.
 * Private to the interactive tier.
 */


/* --------
 * Classes
 * -------- */

/** The background of a row, read by its cells (the pinned ones need it opaque) and by the avatar rings */
export const ROW = [
  'group/row',
  '[--row-bg:var(--color-card)] [--avatar-ring:var(--row-bg)]',
  'not-data-selected:hover:[--row-bg:var(--color-accent)] not-data-selected:focus-within:[--row-bg:var(--color-accent)]',
  'data-selected:[--row-bg:var(--color-primary-soft)]',

  /* The soft badges of a row under the pointer, focused or chosen get a 1px ring, to stay apart from the row */
  '[&:is(:hover,:focus-within,[data-selected])_[data-slot=badge][data-fill=soft]]:inset-ring',
  '[&:is(:hover,:focus-within,[data-selected])_[data-slot=badge][data-fill=soft]]:inset-ring-foreground/20'
].join(' ');

export const CELL = [
  'h-8 border-b border-border bg-(--row-bg) px-3 align-middle whitespace-nowrap group-last/row:border-b-0',

  /* A chosen row under the pointer: its ink at 8% over the soft fill */
  'group-data-selected/row:group-hover/row:bg-linear-to-b group-data-selected/row:group-hover/row:from-primary-soft-foreground/8',
  'group-data-selected/row:group-hover/row:to-primary-soft-foreground/8',
  'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring'
].join(' ');

export const HEAD = [
  'sticky top-0 z-20 h-8 border-b border-border bg-muted px-3 text-start align-middle',
  'text-xs font-semibold whitespace-nowrap text-muted-foreground',
  'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring',

  /* The shade under the header, once the rows have scrolled under it */
  'after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-2 after:bg-linear-to-b after:from-scroll-shade',
  'after:to-transparent after:opacity-0 group-data-scrolled-y/scroller:after:opacity-100'
].join(' ');

/** The shade beside a pinned column, on the side where there is more */
export const PIN_START = [
  'sticky z-10',
  'before:pointer-events-none before:absolute before:inset-y-0 before:-end-2 before:w-2 before:bg-linear-to-r before:from-scroll-shade',
  'before:to-transparent before:opacity-0 group-data-scrolled-x/scroller:before:opacity-100 rtl:before:bg-linear-to-l'
].join(' ');

export const SKELETON_WIDTH: Readonly<Partial<Record<TableColumn<object>['kind'], string>>> = {
  code     : 'w-16',
  reference: 'w-24',
  person   : 'w-28',
  text     : 'w-4/5',
  enum     : 'w-24',
  status   : 'w-20',
  date     : 'w-18',
  datetime : 'w-28',
  number   : 'ms-auto w-12',
  boolean  : 'mx-auto w-4'
};


/* --------
 * Helpers
 * -------- */

/** Whether the text of a cell is cut: the first descendant marked `data-truncate`, or the cell */
export function isTruncated(element: Element): boolean {
  const target = element.querySelector('[data-truncate]') ?? element;

  return target.scrollWidth > target.clientWidth;
}

/** The shades of a scroller follow these attributes: scrolled down or aside, and more to come */
export function markScroll(scroller: HTMLElement): void {
  const left = Math.abs(scroller.scrollLeft);

  scroller.toggleAttribute('data-scrolled-y', scroller.scrollTop > 0);
  scroller.toggleAttribute('data-more-y', scroller.scrollTop + scroller.clientHeight < scroller.scrollHeight - 1);
  scroller.toggleAttribute('data-scrolled-x', left > 0);
  scroller.toggleAttribute('data-more-x', left + scroller.clientWidth < scroller.scrollWidth - 1);
}


/* --------
 * Parts
 * -------- */

export type TruncationTooltipHandle = ReturnType<typeof TooltipPrimitive.createHandle<string>>;

/**
 * One tooltip for every cell of a table: a cell is a `TooltipPrimitive.Trigger` with this handle and its
 * whole text as payload, and the tooltip opens only when that text is cut.
 */
export function TruncationTooltip(props: { handle: TruncationTooltipHandle }): React.ReactNode {
  return (
    <TooltipPrimitive.Root
      handle={props.handle}
      onOpenChange={(open, details) => {
        if (open && (!details.trigger || !isTruncated(details.trigger))) {
          details.cancel();
        }
      }}
    >
      {({ payload }) => (
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Positioner side={'top'} align={'start'} sideOffset={8} collisionPadding={8} className={'z-tooltip'}>
            <TooltipPrimitive.Popup
              aria-hidden={'true'}
              data-slot={'tooltip'}
              className={cn(
                'max-w-70 rounded-sm bg-tooltip px-2 py-1 text-xs text-tooltip-foreground wrap-anywhere',
                'outline-1 -outline-offset-1 outline-transparent',
                'transition-opacity duration-150 data-starting-style:opacity-0',
                'data-ending-style:transition-none data-instant:transition-none motion-reduce:transition-none'
              )}
            >
              {payload}
            </TooltipPrimitive.Popup>
          </TooltipPrimitive.Positioner>
        </TooltipPrimitive.Portal>
      )}
    </TooltipPrimitive.Root>
  );
}
