import type { SpacingValue } from '../../core/responsive';


/*
 * The look of every bordered text control, written once: TextInput, Textarea, NumberInput, the
 * trigger of Select and MultiSelect, the field of Combobox and DatePicker, and `FieldShell`, the same
 * frame offered to a control of the application.
 *
 * Private to the interactive tier: no barrel exports it, and each control reaches it by relative path.
 * With `preserveModules` it is emitted once and shared by every subpath that imports it.
 *
 * The states are read from `data-*` on the element that carries the border, written by the control
 * from its props and from its field: `data-invalid`, `data-readonly`, `data-disabled`. The focus is
 * the one state that cannot be an attribute, and it comes in two forms:
 *
 * - a **frame** around an `<input>` lights only when the text has the focus, never when an action
 *   inside the frame has it;
 * - a control that **is** the bordered element (a textarea, a trigger) lights on its own focus.
 */


/* --------
 * Constants Definition
 * -------- */

/** Border, surface, text, and every state that is not the focus */
const BASE = [
  'rounded-md border border-input bg-card text-sm text-foreground',
  'transition-colors duration-100 motion-reduce:transition-none',
  'not-data-invalid:not-data-readonly:not-data-disabled:hover:border-input-hover',

  /* The error border is drawn inward too, so the text does not move */
  'data-invalid:border-destructive data-invalid:inset-ring data-invalid:inset-ring-destructive',

  'data-readonly:border-border data-readonly:bg-muted',

  'data-disabled:cursor-not-allowed data-disabled:opacity-50'
].join(' ');


/**
 * The focus of a frame: the element inside it that the control marks `data-field-control` (the text
 * of a field, the trigger of a list), and nothing else. Open, the frame keeps the outline and loses
 * the halo, as the guides of the lists want.
 */
export const TEXT_CONTROL_FRAME = [
  BASE,
  'has-[[data-field-control]:focus]:border-ring has-[[data-field-control]:focus]:outline-1',
  'has-[[data-field-control]:focus]:outline-ring',
  'not-has-[[data-popup-open]]:has-[[data-field-control]:focus]:ring-4',
  'not-has-[[data-popup-open]]:has-[[data-field-control]:focus]:ring-ring/20',
  'has-[[data-popup-open]]:border-ring has-[[data-popup-open]]:outline-1 has-[[data-popup-open]]:outline-ring',
  'data-invalid:has-[[data-field-control]:focus]:border-destructive data-invalid:has-[[data-popup-open]]:border-destructive'
].join(' ');


/** The focus of a control that is itself the bordered element */
export const TEXT_CONTROL_SELF = [
  BASE,
  'outline-none',
  'focus:border-ring focus:outline-1 focus:outline-ring focus:ring-4 focus:ring-ring/20',
  'data-invalid:focus:border-destructive'
].join(' ');


/**
 * Height, padding, gap and icon size of the three sizes, shared so that two controls of a row line up.
 * The gap is also in `TEXT_CONTROL_GAP`, which the frames of this section hand to their Stack: it stays
 * here while data spreads these classes on a frame of its own, and leaves when data moves.
 */
/* eslint-disable no-restricted-syntax -- shared class constant consumed by data, migrated with it */
export const TEXT_CONTROL_SIZES = {
  sm: 'h-control-sm gap-1 px-2 [&_svg]:size-3.5',
  md: 'h-control-md gap-1.5 px-2.5 [&_svg]:size-4',
  lg: 'h-control-lg gap-1.5 px-3 [&_svg]:size-4'
} as const;
/* eslint-enable no-restricted-syntax */


/** The room between the parts of a frame, per size: the frame itself is a Stack */
export const TEXT_CONTROL_GAP: Readonly<Record<keyof typeof TEXT_CONTROL_SIZES, SpacingValue>> = {
  sm: 1,
  md: 1.5,
  lg: 1.5
};


/** What the text inside any of them does: placeholder, read only and disabled, autofill */
export const TEXT_CONTROL_TEXT = [
  'tabular-nums',
  'placeholder:text-placeholder contrast-more:placeholder:text-muted-foreground',
  'read-only:placeholder:text-transparent disabled:placeholder:text-transparent',
  'disabled:cursor-not-allowed autofill-card'
].join(' ');


/* --------
 * Types Definition
 * -------- */

export type TextControlSize = keyof typeof TEXT_CONTROL_SIZES;

/** The attributes that carry the states, `undefined` when false so they are absent */
export interface TextControlStateAttributes {
  'data-invalid': true | undefined;
  'data-readonly': true | undefined;
  'data-disabled': true | undefined;
}


/* --------
 * Helpers
 * -------- */

export function textControlState(state: { invalid: boolean; readOnly: boolean; disabled: boolean }): TextControlStateAttributes {
  return {
    'data-invalid' : state.invalid || undefined,
    'data-readonly': state.readOnly || undefined,
    'data-disabled': state.disabled || undefined
  };
}
