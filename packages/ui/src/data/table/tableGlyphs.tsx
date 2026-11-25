import { cn } from '../../core/cn';

import type * as React from 'react';


/* --------
 * Glyphs
 * --------
 * Lucide's paths, drawn here so the package ships no icon library.
 */

const PATHS = {
  arrowDown  : [ 'M12 5v14', 'm19 12-7 7-7-7' ],
  arrowUp    : [ 'm5 12 7-7 7 7', 'M12 19V5' ],
  arrowsUpDown: [ 'm7 15 5 5 5-5', 'm7 9 5-5 5 5' ],
  check      : [ 'M20 6 9 17l-5-5' ],
  ellipsis   : [ 'M12 12h.01', 'M19 12h.01', 'M5 12h.01' ],
  columns    : [ 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z', 'M9 3v18', 'M15 3v18' ],
  first      : [ 'm11 17-5-5 5-5', 'm18 17-5-5 5-5' ],
  previous   : [ 'm15 18-6-6 6-6' ],
  next       : [ 'm9 18 6-6-6-6' ],
  last       : [ 'm6 17 5-5-5-5', 'm13 17 5-5-5-5' ],
  searchX    : [ 'm13.5 8.5-5 5', 'm8.5 8.5 5 5', 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z', 'm21 21-4.3-4.3' ],
  alert      : [ 'M12 8v4', 'M12 16h.01', 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z' ],
  funnelX    : [ 'M12.531 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14v6a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341l.427-.473', 'm16.5 3.5 5 5', 'm21.5 3.5-5 5' ]
} as const;

export type TableGlyphName = keyof typeof PATHS;

/** A 24-unit Lucide glyph; the size comes from the class or from the parent's `[&_svg]` rule */
export function TableGlyph(props: { name: TableGlyphName; className?: string; strokeWidth?: number }): React.ReactNode {
  const { className, name, strokeWidth = 2 } = props;

  return (
    <svg
      viewBox={'0 0 24 24'}
      fill={'none'}
      stroke={'currentColor'}
      strokeWidth={strokeWidth}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
      aria-hidden={'true'}
      focusable={'false'}
      className={cn('shrink-0', className)}
    >
      {PATHS[name].map((path) => <path key={path} d={path} />)}
    </svg>
  );
}
