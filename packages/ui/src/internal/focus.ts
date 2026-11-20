/*
 * What can take the focus, written once. Private to the interactive tier.
 */


/* --------
 * Constants Definition
 * -------- */

/**
 * The elements that take the focus with Tab: links, enabled controls, and anything with a tab index
 * that is not `-1`. A field looks for its control with a narrower selector of its own (no link), and
 * the table grid with a wider one (every control in a cell, to take it out of the Tab order)
 */
export const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(', ');
