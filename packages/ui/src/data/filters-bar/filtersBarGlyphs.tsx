import * as React from 'react';


/* --------
 * Constants Definition
 * -------- */

/** Lucide paths at 24: list-filter, chevron-left, chevron-right */
const PATHS = {
  filter: [ 'M3 6h18', 'M7 12h10', 'M10 18h4' ],
  back  : [ 'm15 18-6-6 6-6' ],
  next  : [ 'm9 18 6-6-6-6' ]
} as const;


/* --------
 * Component Definition
 * -------- */

/** A glyph of the bar, as a node to pass to a button */
export function filtersBarGlyph(name: keyof typeof PATHS): React.ReactNode {
  return (
    <svg
      viewBox={'0 0 24 24'}
      fill={'none'}
      stroke={'currentColor'}
      strokeWidth={2}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
      aria-hidden={'true'}
      focusable={'false'}
      className={name === 'filter' ? undefined : 'rtl:-scale-x-100'}
    >
      {PATHS[name].map((path) => <path key={path} d={path} />)}
    </svg>
  );
}
