import * as React from 'react';

import { cn } from '../../core/cn';
import { responsiveClasses } from '../../core/responsive';

import type { Direction, Responsive } from '../../core/responsive';


/*
 * What Checkbox, Radio and Switch share, and what the list panel will draw for its options: the
 * row, the text block, the marks. Private to the interactive tier, reached by relative path.
 */


/* --------
 * Constants Definition
 * -------- */

/**
 * The row is a `<label>`: the whole of it, box, text and description, presses the control. The states
 * are written on it as `data-*` by the control, so the text can follow them.
 */
export const CHOICE_ROW = [
  'group/choice relative flex items-start gap-2 text-sm text-foreground',
  'cursor-pointer data-disabled:cursor-not-allowed data-readonly:cursor-default'
].join(' ');

/** The focus of a box, a circle or a track: 2px outline 2px away and a halo, keyboard only */
export const CHOICE_FOCUS = [
  'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
  'focus-visible:ring-7 focus-visible:ring-ring/20'
].join(' ');

/** Box, circle and track sit on the first line of the label: 16 on a line of 20 */
export const CHOICE_ALIGN = 'mt-0.5 shrink-0';

/**
 * The layout of a group per orientation. Each one says everything the other one sets (wrap, both gaps,
 * the growth of a card), so a group that turns from a column into a row at a breakpoint keeps nothing
 * of the column. Each class, with every breakpoint prefix, is declared in `theme.css`.
 */
const GROUP_LAYOUT: Readonly<Record<'list' | 'card', Readonly<Record<Direction, string>>>> = {
  list: {
    vertical  : 'flex-col flex-nowrap gap-2',
    horizontal: 'flex-row flex-wrap gap-x-4 gap-y-2'
  },
  card: {
    vertical  : 'flex-col flex-nowrap gap-2 *:flex-initial',
    horizontal: 'flex-row flex-wrap gap-2 *:flex-1'
  }
};


/* --------
 * Helpers
 * -------- */

/** The classes of a group of options, from its orientation: one value, or one per breakpoint */
export function choiceGroupClasses(orientation: Responsive<Direction>, shape: 'list' | 'card' = 'list'): string[] {
  return responsiveClasses(orientation, (value) => GROUP_LAYOUT[shape][value]);
}

/** The orientation at the narrowest width, for `data-orientation` */
export function baseOrientation(orientation: Responsive<Direction>): Direction {
  return typeof orientation === 'object' ? (orientation.base ?? 'vertical') : orientation;
}

export function isPresent(node: React.ReactNode): boolean {
  return node !== null && node !== undefined && node !== false && node !== '';
}


/* --------
 * Parts
 * -------- */

interface ChoiceTextProps {
  /** The prefix of the slots: `checkbox`, `radio`, `switch` */
  slot: string;
  label: React.ReactNode;
  description: React.ReactNode;
  descriptionId: string;
  required?: boolean;
}

/**
 * The label and the description of an option.
 *
 * Disabled, the label fades with the control and the description does not: it is where the reason
 * is written, and a reason at half opacity is a reason nobody reads.
 */
export function ChoiceText(props: ChoiceTextProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { description, descriptionId, label, required = false, slot } = props;


  // ----
  // Component Render
  // ----
  if (!isPresent(label) && !isPresent(description)) {
    return null;
  }

  return (
    <span data-slot={`${slot}-text`} className={'flex min-w-0 flex-col gap-0.5'}>
      {isPresent(label) && (
        <span data-slot={`${slot}-label`} className={'group-data-disabled/choice:opacity-50'}>
          {label}
          {required && (
            <span data-slot={'field-required'} aria-hidden={'true'} className={'ms-0.5 text-destructive'}>*</span>
          )}
        </span>
      )}

      {isPresent(description) && (
        <span id={descriptionId} data-slot={`${slot}-description`} className={'text-sm text-muted-foreground'}>
          {description}
        </span>
      )}
    </span>
  );

}


/* --------
 * Glyphs
 * -------- */

interface GlyphProps {
  className?: string;
}

/** The tick of a checked box, a stroke of 2 on a grid of 12 */
export function CheckGlyph(props: GlyphProps): React.ReactNode {
  return (
    <svg
      viewBox={'0 0 12 12'}
      fill={'none'}
      stroke={'currentColor'}
      strokeWidth={2}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
      aria-hidden={'true'}
      focusable={'false'}
      className={cn('size-3', props.className)}
    >
      <path d={'M2.5 6.25l2.25 2.25 4.75-5'} />
    </svg>
  );
}


/** The dash of a partial box: the same weight as the tick, only the mark changes */
export function DashGlyph(props: GlyphProps): React.ReactNode {
  return (
    <svg
      viewBox={'0 0 12 12'}
      fill={'none'}
      stroke={'currentColor'}
      strokeWidth={2}
      strokeLinecap={'round'}
      aria-hidden={'true'}
      focusable={'false'}
      className={cn('size-3', props.className)}
    >
      <path d={'M3 6h6'} />
    </svg>
  );
}
