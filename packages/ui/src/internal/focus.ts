/*
 * What can take the focus, written once. Private to the package.
 */


/* --------
 * Constants Definition
 * -------- */

/**
 * The elements that take the focus with Tab: links, enabled controls, and anything with a tab index
 * that is not `-1`. A field looks for its control with a narrower selector of its own (no link), and
 * the table grid with a wider one (every control in a cell, to take it out of the Tab order).
 *
 * `:disabled` is on the tab index entry too, and that is the line that matters: Base UI writes
 * `tabindex="0"` on a disabled `Button`, so `[tabindex]` alone matched a button that refuses the
 * focus, and whoever moved the focus there left it on the `body`. `:disabled` rather than
 * `[disabled]` also covers a control inside a disabled `fieldset`.
 */
export const FOCUSABLE = [
  'a[href]',
  'button:not(:disabled)',
  'input:not(:disabled):not([type="hidden"])',
  'select:not(:disabled)',
  'textarea:not(:disabled)',
  '[tabindex]:not([tabindex="-1"]):not(:disabled)'
].join(', ');


/* --------
 * Helpers
 * -------- */

/**
 * Whether an element the selector found can take the focus now. A selector cannot see an `inert`
 * ancestor, which is what a veil or a closing panel puts over its content: `focus()` on what is
 * under it does nothing, and the focus would stay where it was.
 */
export function canTakeFocus(element: HTMLElement): boolean {
  return element.closest('[inert]') === null;
}
