import { CONTROL_HEIGHT } from '../../internal/control';

import type { ControlSize } from '../../core/control';
import type { SpacingValue } from '../../core/responsive';


/*
 * The look of every bordered text control, written once: TextInput, Textarea, NumberInput, the
 * trigger of Select and MultiSelect, the field of Combobox and DatePicker, and `FieldShell`, the same
 * frame offered to a control of the application.
 *
 * Private to the package: no barrel exports it, and each control reaches it by relative path.
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
  'rounded-control border border-input bg-card text-sm text-foreground',
  'transition-colors duration-100 motion-reduce:transition-none',
  'not-data-invalid:not-data-status:not-data-readonly:not-data-disabled:hover:border-input-hover',

  /* The error border is drawn inward too, so the text does not move */
  'data-invalid:border-destructive data-invalid:inset-ring data-invalid:inset-ring-destructive',

  /*
   * A warning and a success colour the border with the ink of their tone, a single line: the double one
   * is the mark of an error alone, which is the one status that stops a submit
   */
  'data-[status=warning]:border-warning-soft-foreground data-[status=success]:border-success-soft-foreground',

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
  'has-[[data-field-control]:focus]:border-ring has-[[data-field-control]:focus]:outline-1 has-[[data-field-control]:focus]:outline-solid',
  'has-[[data-field-control]:focus]:outline-ring',
  'not-has-[[data-popup-open]]:has-[[data-field-control]:focus]:ring-4',
  'not-has-[[data-popup-open]]:has-[[data-field-control]:focus]:ring-ring/20',
  'has-[[data-popup-open]]:border-ring has-[[data-popup-open]]:outline-1 has-[[data-popup-open]]:outline-solid has-[[data-popup-open]]:outline-ring',
  /* A status keeps its colour under the focus: the border, the outline and the halo, not the grey of the ring */
  'data-invalid:has-[[data-field-control]:focus]:border-destructive data-invalid:has-[[data-popup-open]]:border-destructive',
  'data-invalid:has-[[data-field-control]:focus]:outline-destructive data-invalid:has-[[data-popup-open]]:outline-destructive',
  'data-invalid:has-[[data-field-control]:focus]:ring-destructive/20',
  'data-[status=warning]:has-[[data-field-control]:focus]:border-warning-soft-foreground',
  'data-[status=warning]:has-[[data-field-control]:focus]:outline-warning-soft-foreground',
  'data-[status=warning]:has-[[data-field-control]:focus]:ring-warning/20',
  'data-[status=success]:has-[[data-field-control]:focus]:border-success-soft-foreground',
  'data-[status=success]:has-[[data-field-control]:focus]:outline-success-soft-foreground',
  'data-[status=success]:has-[[data-field-control]:focus]:ring-success/20'
].join(' ');


/** The focus of a control that is itself the bordered element */
export const TEXT_CONTROL_SELF = [
  BASE,
  'outline-none',
  'focus:border-ring focus:outline-1 focus:outline-solid focus:outline-ring focus:ring-4 focus:ring-ring/20',
  'data-invalid:focus:border-destructive data-invalid:focus:outline-destructive data-invalid:focus:ring-destructive/20',
  'data-[status=warning]:focus:border-warning-soft-foreground data-[status=warning]:focus:outline-warning-soft-foreground',
  'data-[status=warning]:focus:ring-warning/20',
  'data-[status=success]:focus:border-success-soft-foreground data-[status=success]:focus:outline-success-soft-foreground',
  'data-[status=success]:focus:ring-success/20'
].join(' ');


/**
 * Height, padding and icon size of the three sizes. The height is `CONTROL_HEIGHT`, the one every
 * control reads, so a field lines up with a button of the same size; `frame-room-*` tells the input
 * inside how tall the frame is, for `frame-line`. The gap is `TEXT_CONTROL_GAP`, which every frame
 * hands to its Stack.
 */
export const TEXT_CONTROL_SIZES: Readonly<Record<ControlSize, string>> = {
  sm: `${CONTROL_HEIGHT.sm} frame-room-sm px-2 [&_svg]:size-3.5`,
  md: `${CONTROL_HEIGHT.md} frame-room-md px-2.5 [&_svg]:size-4`,
  lg: `${CONTROL_HEIGHT.lg} frame-room-lg px-3 [&_svg]:size-4`
};


/** The room between the parts of a frame, per size: the frame itself is a Stack */
export const TEXT_CONTROL_GAP: Readonly<Record<ControlSize, SpacingValue>> = {
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

export type TextControlSize = ControlSize;

/** The attributes that carry the states, `undefined` when false so they are absent */
export interface TextControlStateAttributes {
  'data-invalid': true | undefined;
  'data-readonly': true | undefined;
  'data-disabled': true | undefined;
  'data-status': 'warning' | 'success' | undefined;
}

/** A status a frame draws besides the error, which is `data-invalid` */
export type TextControlStatus = 'error' | 'warning' | 'success';


/* --------
 * Helpers
 * -------- */

export function textControlState(state: {
  invalid: boolean;
  readOnly: boolean;
  disabled: boolean;
  status?: TextControlStatus;
}): TextControlStateAttributes {
  return {
    'data-invalid' : state.invalid || undefined,
    'data-readonly': state.readOnly || undefined,
    'data-disabled': state.disabled || undefined,
    'data-status'  : !state.invalid && (state.status === 'warning' || state.status === 'success') ? state.status : undefined
  };
}
