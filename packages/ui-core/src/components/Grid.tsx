import * as React from 'react';

import { splitBaseProps } from '../lib/base';
import { cn } from '../lib/cn';
import { gapClasses } from '../lib/responsive';

import type { PolymorphicProps } from '../lib/polymorphic';

import type { BaseProps } from '../lib/base';

import type { Responsive, SpacingValue } from '../lib/responsive';


/* --------
 * Types Definition
 * -------- */
export interface StrictGridProps extends BaseProps {
  /** Space between cells, in Tailwind spacing steps */
  gap?: Responsive<SpacingValue>;

  /**
   * `fill` keeps the empty tracks, so a row of two cards keeps the width of three.
   * `fit` collapses them and the cards stretch.
   */
  fill?: 'fill' | 'fit';

  /** How narrow a column may get before the grid wraps, in pixels */
  minColWidth?: number;

}


export type GridProps<E extends React.ElementType = 'div'> = PolymorphicProps<E, StrictGridProps>;


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
export function Grid<E extends React.ElementType = 'div'>(props: GridProps<E>): React.ReactNode {

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
    ...others
  } = props as GridProps<'div'>;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Component Render
  // ----
  return (
    <Component
      data-slot={'grid'}
      className={cn('grid', gapClasses(gap), baseClasses, className)}
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
