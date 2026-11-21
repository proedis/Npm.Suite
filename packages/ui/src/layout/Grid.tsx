import * as React from 'react';

import { splitBaseProps } from '../core/base';
import { cn } from '../core/cn';
import { gapClasses } from '../core/responsive';

import { DEFAULT_GAP_CLASS } from './defaultGap';
import { layoutAttributes } from './layoutAttributes';

import type { BaseProps } from '../core/base';
import type { PolymorphicProps } from '../core/polymorphic';
import type { Responsive, Spacing } from '../core/responsive';


/* --------
 * Types Definition
 * -------- */
export interface StrictGridProps extends BaseProps {
  /** Space between cells: a step of the spacing scale by name, or a Tailwind spacing step by number.
   * Defaults to `md`, moved by the theme with `--grid-gap` */
  gap?: Responsive<Spacing>;

  /**
   * `fill` keeps the empty tracks, so a row of two cards keeps the width of three.
   * `fit` collapses them and the cards stretch. Defaults to `fill`
   */
  fill?: 'fill' | 'fit';

  /** How narrow a column may get before the grid wraps, in pixels. Defaults to `240` */
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
    gap,
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
      {...layoutAttributes(rest, { 'data-fill': fill })}
      className={cn('grid', gap === undefined ? DEFAULT_GAP_CLASS.grid : gapClasses(gap), baseClasses, className)}
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
