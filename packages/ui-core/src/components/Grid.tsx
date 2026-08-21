import * as React from 'react';

import { cn } from '../lib/cn';
import { gapClasses } from '../lib/responsive';

import type { Responsive, SpacingValue } from '../lib/responsive';


/* --------
 * Types Definition
 * -------- */
export interface GridProps extends React.ComponentProps<'div'> {
  /** Space between cells, in Tailwind spacing steps */
  gap?: Responsive<SpacingValue>;

  /**
   * `fill` keeps the empty tracks, so a row of two cards keeps the width of three.
   * `fit` collapses them and the cards stretch.
   */
  fill?: 'fill' | 'fit';

  /** How narrow a column may get before the grid wraps, in pixels */
  minColWidth?: number;

  /** Render as something else than a `div` */
  as?: React.ElementType;
}


/* --------
 * Component Definition
 * -------- */

/**
 * A grid whose columns size themselves, with no breakpoints declared.
 *
 * ```tsx
 * <Grid minColWidth={280} gap={4}>{cards}</Grid>
 * ```
 *
 * `repeat(auto-fill, minmax(…, 1fr))` reflows a gallery at every width, which is what a card list
 * actually wants — as opposed to `Stack columns`, where the count per breakpoint is the design.
 */
export function Grid(props: GridProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    as: Component = 'div',
    className,
    fill = 'fill',
    gap = 4,
    minColWidth = 240,
    style,
    ...rest
  } = props;


  // ----
  // Component Render
  // ----
  return (
    <Component
      data-slot={'grid'}
      className={cn('grid', gapClasses(gap), className)}
      style={{
        /** `min(px, 100%)` is what keeps the single column from overflowing a very narrow screen */
        gridTemplateColumns: `repeat(auto-${fill}, minmax(min(${minColWidth}px, 100%), 1fr))`,
        ...style
      }}
      {...rest}
    />
  );

}

Grid.displayName = 'Grid';
