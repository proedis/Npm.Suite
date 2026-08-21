import * as React from 'react';

import { splitBaseProps } from '../core/base';
import { cn } from '../core/cn';
import { breakpointPrefix, gapClasses } from '../core/responsive';

import type { PolymorphicProps } from '../core/polymorphic';

import type { BaseProps } from '../core/base';

import type { MediaBreakpoint, Responsive, SpacingValue } from '../core/responsive';


/* --------
 * Types Definition
 * -------- */
export interface StrictSplitProps extends BaseProps {
  /**
   * Stack the two panes on top of each other below this breakpoint.
   *
   * The rail comes first when it sits at the start and last when it sits at the end, because the
   * stacked order is the DOM order — which is also the order a screen reader announces.
   */
  collapseBelow?: MediaBreakpoint;

  /** Space between the two panes, in Tailwind spacing steps */
  gap?: Responsive<SpacingValue>;

  /** The fixed pane: a navigation rail, a filter column, an inspector */
  rail: React.ReactNode;

  /** Width of the fixed pane. Any CSS length, or pixels as a number. Defaults to `16rem` */
  railWidth?: number | string;

  /** Which side the rail sits on. Defaults to `start` */
  side?: 'start' | 'end';

}


export type SplitProps<E extends React.ElementType = 'div'> = PolymorphicProps<E, StrictSplitProps>;


/** The inline style of this component carries a custom property, which `CSSProperties` cannot type */
interface SplitStyle extends React.CSSProperties {
  '--split-rail': string;
}


/* --------
 * Constants Definition
 * -------- */
const DEFAULT_RAIL_WIDTH = '16rem';


/* --------
 * Internal Helpers
 * -------- */

/**
 * A CSS length from a number of pixels or a string.
 *
 * ⚠️ Written by hand rather than left to React, which appends `px` to a numeric style value only for
 * the properties it knows: a **custom property** is passed through verbatim, so `24` would land in
 * the stylesheet as `--split-rail: 24` and the grid template would be invalid. That is the reason
 * `Center` can hand `maxWidth` straight to the style object and this cannot.
 */
function toLength(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value;
}


/* --------
 * Component Definition
 * -------- */

/**
 * The two pane application frame: one pane of a fixed width, one taking the rest.
 *
 * ```tsx
 * <Split rail={<Navigation />} railWidth={'18rem'} collapseBelow={'lg'}>
 *   <main>…</main>
 * </Split>
 * ```
 *
 * The rail is a **prop** rather than the first child, and that is a deliberate constraint: with
 * `side={'end'}` the pane has to come after the content in the DOM, so that the reading order and
 * the tab order match what the eye sees. Handing this component the two pieces separately is what
 * lets it place them; two children in a fixed order could only ever be reordered visually.
 *
 * The width travels as a custom property read by the `split-cols` utility, instead of an inline
 * `grid-template-columns`. That is what makes `collapseBelow` possible at all: a media query cannot
 * live in an inline style, so the responsive half has to be a class — and a class cannot carry an
 * arbitrary length.
 *
 * ⚠️ `*:min-w-0` is load-bearing, not decoration. A grid item refuses to shrink below its content,
 * so a wide table or a long unbroken string inside the flexible pane would push the whole frame past
 * the viewport and hand the page a horizontal scrollbar.
 */
export function Split<E extends React.ElementType = 'div'>(props: SplitProps<E>): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    as: Component = 'div',
    children,
    className,
    collapseBelow,
    gap,
    rail,
    railWidth = DEFAULT_RAIL_WIDTH,
    side = 'start',
    style,
    ...others
  } = props as SplitProps<'div'>;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Layout Computation
  // ----
  const template = side === 'start' ? 'split-cols' : 'split-cols-end';

  const templateClasses = collapseBelow === undefined
    ? [ template ]
    : [ 'grid-cols-1', `${breakpointPrefix(collapseBelow)}${template}` ];


  // ----
  // Component Render
  // ----
  return (
    <Component
      data-slot={'split'}
      data-side={side}
      data-collapse-below={collapseBelow}
      className={cn('grid *:min-w-0', templateClasses, gapClasses(gap), baseClasses, className)}
      style={{ '--split-rail': toLength(railWidth), ...style } as SplitStyle}
      {...rest}
    >
      {side === 'start' && rail}
      {children}
      {side === 'end' && rail}
    </Component>
  );

}

Split.displayName = 'Split';
