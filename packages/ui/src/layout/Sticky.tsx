import * as React from 'react';

import { splitBaseProps } from '../core/base';
import { cn } from '../core/cn';

import type { PolymorphicProps } from '../core/polymorphic';

import type { BaseProps } from '../core/base';

import type { SpacingValue } from '../core/responsive';


/* --------
 * Types Definition
 * -------- */
export interface StrictStickyProps extends BaseProps {
  /** Distance from the edge, in Tailwind spacing steps */
  offset?: SpacingValue;

  /** Which edge to pin to */
  position?: 'top' | 'bottom';

  /** Stacking order */
  z?: number;

}


export type StickyProps<E extends React.ElementType = 'div'> = PolymorphicProps<E, StrictStickyProps>;


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
export function Sticky<E extends React.ElementType = 'div'>(props: StickyProps<E>): React.ReactNode {

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
    ...others
  } = props as StickyProps<'div'>;

  const { baseClasses, rest } = splitBaseProps(others);


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
      data-position={position}
      className={cn('sticky', baseClasses, className)}
      style={{ ...(position === 'top' ? { top: edge } : { bottom: edge }), zIndex: z, ...style }}
      {...rest}
    />
  );

}

Sticky.displayName = 'Sticky';
