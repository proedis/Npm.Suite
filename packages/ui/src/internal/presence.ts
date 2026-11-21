import type * as React from 'react';


/*
 * Whether a slot holds something, written once. Private to the package.
 */


/* --------
 * Helpers
 * -------- */

/**
 * Whether a node renders anything. `null`, `undefined`, `false` and the empty string render nothing,
 * so the part built around them would be an empty box: a footer with no buttons, a description with
 * no text, a row with nothing in it. `0` renders, so it is present.
 */
export function isPresent(node: React.ReactNode): boolean {
  return node !== null && node !== undefined && node !== false && node !== '';
}
