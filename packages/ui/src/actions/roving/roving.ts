import type * as React from 'react';


/*
 * The arrows of a group of buttons, written here because Base UI's composite skips an item marked
 * `aria-disabled` when the group passes no list of disabled indices, and its ToggleGroup passes none.
 * The design systems want the opposite: a disabled item stays in the arrow cycle, to show its tooltip
 * with the reason. The handler runs before Base UI's and stops it; Base UI then follows the focus.
 */


/* --------
 * Types Definition
 * -------- */

export type RovingKeyboardEvent = React.KeyboardEvent<HTMLElement> & { preventBaseUIHandler?: () => void };


/* --------
 * Helpers
 * -------- */

/**
 * ← → move to the previous or next item and loop, Home and End to the first and last. Every item that
 * matches `selector` inside the group counts, disabled ones included.
 */
export function handleRovingKeyDown(
  event: RovingKeyboardEvent,
  selector: string,
  orientation: 'horizontal' | 'vertical' = 'horizontal'
): void {
  const vertical = orientation === 'vertical';
  const steps: Record<string, number | 'first' | 'last'> = vertical
    ? { ArrowUp: -1, ArrowDown: 1, Home: 'first', End: 'last' }
    : { ArrowLeft: -1, ArrowRight: 1, Home: 'first', End: 'last' };

  const step = steps[event.key];

  if (step === undefined || event.altKey || event.ctrlKey || event.metaKey) {
    return;
  }

  const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(selector));
  const current = items.findIndex((item) => item === document.activeElement);

  if (items.length === 0 || current < 0) {
    return;
  }

  /* Right to left turns the arrows of a row, never the ones of a column */
  const rtl = !vertical && getComputedStyle(event.currentTarget).direction === 'rtl';
  let next: number;

  if (step === 'first') {
    next = 0;
  }
  else if (step === 'last') {
    next = items.length - 1;
  }
  else {
    next = (current + (rtl ? -step : step) + items.length) % items.length;
  }

  event.preventBaseUIHandler?.();
  event.preventDefault();
  items[next].focus();
}
