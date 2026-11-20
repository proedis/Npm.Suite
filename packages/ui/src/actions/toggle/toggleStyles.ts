/*
 * The look of a button that stays on, shared by `Toggle` and the items of `SegmentedControl`. Off it
 * is a `plain muted` button, on it is filled with `primary`; the layers under the pointer and the
 * disabled state follow the guides of the two components.
 */


/* --------
 * Constants Definition
 * -------- */

/** What every pressable item is, before its size. The row itself is a Stack, which each component renders through `render` */
export const PRESSABLE_BASE = [
  'group/pressable relative shrink-0 cursor-pointer',
  'border border-transparent font-medium whitespace-nowrap select-none',
  'transition-colors duration-100 motion-reduce:transition-none',
  'outline-none [&_svg]:pointer-events-none [&_svg]:shrink-0',
  'data-disabled:cursor-not-allowed'
].join(' ');

/** Off: no fill, a muted ink that darkens under the pointer, a layer of its own ink at 8% and 16% */
export const PRESSABLE_OFF = [
  'not-data-pressed:text-muted-foreground',
  'not-data-pressed:not-data-disabled:hover:text-foreground not-data-pressed:not-data-disabled:active:text-foreground',
  'not-data-pressed:not-data-disabled:hover:bg-linear-to-b not-data-pressed:not-data-disabled:hover:from-current/8 not-data-pressed:not-data-disabled:hover:to-current/8',
  'not-data-pressed:not-data-disabled:active:bg-linear-to-b not-data-pressed:not-data-disabled:active:from-current/16 not-data-pressed:not-data-disabled:active:to-current/16'
].join(' ');

/** On: filled with `primary`, half of it when disabled */
export const PRESSABLE_ON = [
  'data-pressed:bg-primary data-pressed:text-primary-foreground',
  'data-pressed:data-disabled:bg-primary/50',

  /* The system colours: the fill becomes Highlight, whatever the theme */
  'forced-colors:data-pressed:forced-highlight'
].join(' ');

/** The layers over the fill, for an item that reacts when on (the Toggle, not the chosen segment) */
export const PRESSABLE_ON_LAYERS = [
  'data-pressed:not-data-disabled:hover:bg-linear-to-b data-pressed:not-data-disabled:hover:from-state-hover data-pressed:not-data-disabled:hover:to-state-hover',
  'data-pressed:not-data-disabled:active:bg-linear-to-b data-pressed:not-data-disabled:active:from-state-pressed data-pressed:not-data-disabled:active:to-state-pressed'
].join(' ');

/**
 * Disabled, the opacity goes on the content and never on the button, so the focus outline stays
 * whole: 50% off, 70% on (over the fill that is already at half).
 */
export const PRESSABLE_CONTENT = [
  'group-data-disabled/pressable:opacity-50 group-data-pressed/pressable:group-data-disabled/pressable:opacity-70'
].join(' ');

/** The focus inside the item: it never leaves the button nor covers the one beside it */
export const FOCUS_INSIDE = 'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring';
