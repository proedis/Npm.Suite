import * as React from 'react';

import { cn } from '../lib/cn';

import type { SpacingValue } from '../lib/responsive';


/* --------
 * Types Definition
 * -------- */
export interface StickyProps extends React.ComponentProps<'div'> {
  /** Distance from the edge, in Tailwind spacing steps */
  offset?: SpacingValue;

  /** Which edge to pin to */
  position?: 'top' | 'bottom';

  /** Stacking order */
  z?: number;

  /** Render as something else than a `div` */
  as?: React.ElementType;
}


/* --------
 * Constants Definition
 * -------- */

/** Tailwind's spacing step, in rem. One step is 0.25rem */
const SPACING_STEP_REM = 0.25;


/* --------
 * Component Definition
 * -------- */

/**
 * Pins its content to an edge of the nearest scroll container.
 *
 * ⚠️ `position: sticky` does nothing when an ancestor clips its overflow. A sticky header that never
 * sticks is almost always an `overflow-hidden` two levels up, not a bug here.
 */
export function Sticky(props: StickyProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    as: Component = 'div',
    className,
    offset = 0,
    position = 'top',
    style,
    z = 10,
    ...rest
  } = props;


  // ----
  // Layout Computation
  // ----
  const edge = `${offset * SPACING_STEP_REM}rem`;


  // ----
  // Component Render
  // ----
  return (
    <Component
      data-slot={'sticky'}
      className={cn('sticky', className)}
      style={{ ...(position === 'top' ? { top: edge } : { bottom: edge }), zIndex: z, ...style }}
      {...rest}
    />
  );

}

Sticky.displayName = 'Sticky';
