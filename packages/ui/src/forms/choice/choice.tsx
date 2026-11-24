import * as React from 'react';

import { responsiveClasses } from '../../core/responsive';

import { Stack } from '../../layout/Stack';

import { Label } from '../../primitives/Label';

import { isPresent } from '../../internal/presence';


import type { Direction, Responsive } from '../../core/responsive';


/*
 * What Checkbox, Radio and Switch share, and what the list panel will draw for its options: the
 * row, the text block, the marks. Private to the package, reached by relative path.
 */


/* --------
 * Constants Definition
 * -------- */

/**
 * The row is a `<label>`: the whole of it, box, text and description, presses the control. The states
 * are written on it as `data-*` by the control, so the text can follow them. The row itself is a Stack
 * (horizontal, aligned at the start, gap 2), which each control renders.
 */
export const CHOICE_ROW = [
  'group/choice relative text-sm text-foreground',
  'cursor-pointer data-disabled:cursor-not-allowed data-readonly:cursor-default'
].join(' ');

/** The focus of a box, a circle or a track: 2px outline 2px away and a halo, keyboard only */
export const CHOICE_FOCUS = [
  'outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring',
  'focus-visible:ring-7 focus-visible:ring-ring/20'
].join(' ');

/** Box, circle and track sit on the first line of the label: 16 on a line of 20 */
export const CHOICE_ALIGN = 'mt-0.5 shrink-0';

/**
 * The box of a checkbox: its states written on it by Base UI as `data-*`. Shared by `Checkbox`, which
 * adds the alignment on the first line and the focus of a control, and by `CheckboxGrid`, whose cell
 * carries the focus instead. The hover reads `group/choice`, on the row or on the cell. The box centres
 * its mark as an inline Stack, which both readers give it through `render`.
 */
export const CHECKBOX_BOX = [
  'relative size-4 rounded-sm border border-input bg-card text-primary-foreground',
  'transition-colors duration-100 motion-reduce:transition-none',

  /* Checked and partial weigh the same: only the mark changes. The transparent border lets a layer reach the edge */
  'data-checked:border-transparent data-checked:bg-primary data-indeterminate:border-transparent data-indeterminate:bg-primary',

  /* Under the pointer: a stronger border when empty, the state veil when filled */
  'not-data-disabled:not-data-readonly:group-hover/choice:border-input-hover',
  'not-data-disabled:not-data-readonly:group-hover/choice:data-checked:bg-linear-to-b',
  'not-data-disabled:not-data-readonly:group-hover/choice:data-checked:from-state-hover',
  'not-data-disabled:not-data-readonly:group-hover/choice:data-checked:to-state-hover',
  'not-data-disabled:not-data-readonly:group-hover/choice:data-indeterminate:bg-linear-to-b',
  'not-data-disabled:not-data-readonly:group-hover/choice:data-indeterminate:from-state-hover',
  'not-data-disabled:not-data-readonly:group-hover/choice:data-indeterminate:to-state-hover',

  /* Error: the border drawn inward when empty, the fill red when ticked */
  'data-invalid:border-destructive data-invalid:inset-ring data-invalid:inset-ring-destructive',
  'data-invalid:data-checked:bg-destructive data-invalid:data-checked:inset-ring-0',
  'data-invalid:data-indeterminate:bg-destructive data-invalid:data-indeterminate:inset-ring-0',

  /* Read only is grey at full opacity, disabled is half: two different states */
  'data-readonly:bg-muted data-readonly:data-checked:bg-muted-foreground data-readonly:data-checked:text-card',
  'data-readonly:data-indeterminate:bg-muted-foreground data-readonly:data-indeterminate:text-card',
  'data-disabled:opacity-50'
].join(' ');

/**
 * The layout of a group per orientation. Each one says everything the other one sets (wrap, both gaps,
 * the growth of a card), so a group that turns from a column into a row at a breakpoint keeps nothing
 * of the column. Each class, with every breakpoint prefix, is declared in `theme.css`. The direction
 * itself is the `direction` of the Stack each group renders, which takes the same responsive value.
 */
/* eslint-disable no-restricted-syntax -- the row of a list group has gap-x and gap-y apart, and wrap switches per breakpoint */
const GROUP_LAYOUT: Readonly<Record<'list' | 'card', Readonly<Record<Direction, string>>>> = {
  list: {
    vertical  : 'flex-nowrap gap-2',
    horizontal: 'flex-wrap gap-x-4 gap-y-2'
  },
  card: {
    vertical  : 'flex-nowrap gap-2 *:flex-initial',
    horizontal: 'flex-wrap gap-2 *:flex-1'
  }
};
/* eslint-enable no-restricted-syntax */


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


/** The option of a group that holds the group's tab stop: the chosen radio, or the first box */
const GROUP_TAB_STOP = '[tabindex="0"]';

/**
 * What lets a group take its field's focus.
 *
 * A group marks its root with `data-field-control`, since that root is what a field, an error summary
 * and a dialog look for when they move the focus to the control. The root of Base UI's groups is a
 * plain `div`, though, and focusing it did nothing. These props make it focusable by script only
 * (`tabIndex -1`, never a Tab stop) and hand the focus straight on to the option holding the tab stop.
 */
export const GROUP_FOCUS_PROPS = {
  tabIndex: -1,
  onFocus : (event: React.FocusEvent<HTMLElement>): void => {
    if (event.target === event.currentTarget) {
      event.currentTarget.querySelector<HTMLElement>(GROUP_TAB_STOP)?.focus();
    }
  }
};


/* --------
 * Parts
 * -------- */

interface ChoiceTextProps {
  /** The prefix of the slot of the text block: `checkbox`, `radio`, `switch` */
  slot: string;
  label: React.ReactNode;
  description: React.ReactNode;

  /** The id of the label, which the control names itself by: the row would bring the description along */
  labelId: string;
  descriptionId: string;
  required?: boolean;
}

/**
 * The label and the description of an option: a `Label` in the register of an option, and its
 * description beside it.
 *
 * The row around them is a `<label>`, so a press anywhere on it presses the control. That same row
 * would be the name of the control, description included, read at every focus and once more through
 * `aria-describedby`: the control is named by the `Label` alone (`aria-labelledby={labelId}`), and
 * described by the description.
 *
 * Disabled, the label fades with the control and the description does not: it is where the reason
 * is written, and a reason at half opacity is a reason nobody reads.
 */
export function ChoiceText(props: ChoiceTextProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { description, descriptionId, label, labelId, required = false, slot } = props;


  // ----
  // Component Render
  // ----
  if (!isPresent(label) && !isPresent(description)) {
    return null;
  }

  return (
    <Stack as={'span'} data-slot={`${slot}-text`} gap={0.5} className={'min-w-0'}>
      {isPresent(label) && (
        <Label as={'span'} id={labelId} emphasis={'regular'} required={required} className={'group-data-disabled/choice:opacity-50'}>
          {label}
        </Label>
      )}

      {isPresent(description) && (
        <Label.Description id={descriptionId}>{description}</Label.Description>
      )}
    </Stack>
  );

}
