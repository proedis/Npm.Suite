import * as React from 'react';

import { splitBaseProps } from '../core/base';
import { cn } from '../core/cn';
import { BREAKPOINTS, breakpointPrefix, gapClasses, responsiveEntries, toResponsiveMap } from '../core/responsive';

import { DEFAULT_GAP_CLASS } from './defaultGap';

import type { BaseProps } from '../core/base';
import type { PolymorphicProps } from '../core/polymorphic';
import type { Breakpoint, MediaBreakpoint, Responsive, Spacing } from '../core/responsive';


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

  /** Space between the two panes: a step of the spacing scale by name, or a Tailwind spacing step by number.
   * Defaults to `md`, moved by the theme with `--split-gap` */
  gap?: Responsive<Spacing>;

  /** The fixed pane: a navigation rail, a filter column, an inspector */
  rail: React.ReactNode;

  /**
   * Hide the rail, per breakpoint: `{ base: true, lg: false }` is a navigation that exists from `lg` up.
   * Where it is hidden the content takes the whole width.
   *
   * Declared, the rail is wrapped in an element of its own (`data-slot="split-rail"`) with
   * `display: contents` where it shows, so the rail still lays out as the grid item it was.
   */
  railHide?: Responsive<boolean>;

  /**
   * Width of the fixed pane, per breakpoint if needed. Any CSS length, or pixels as a number. Defaults
   * to `16rem`
   */
  railWidth?: Responsive<number | string>;

  /** Which side the rail sits on. Defaults to `start` */
  side?: 'start' | 'end';

}


export type SplitProps<E extends React.ElementType = 'div'> = PolymorphicProps<E, StrictSplitProps>;


/** The inline style of this component carries a custom property, which `CSSProperties` cannot type */
interface SplitStyle extends React.CSSProperties {
  '--split-rail'?: string;
  '--split-rail-base'?: string;
  '--split-rail-sm'?: string;
  '--split-rail-md'?: string;
  '--split-rail-lg'?: string;
  '--split-rail-xl'?: string;
  '--split-rail-2xl'?: string;
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

/**
 * The width of the rail, as variables. One width is `--split-rail` itself. A width per breakpoint is
 * one variable each, `--split-rail-base` and `--split-rail-<bp>`, and a class per breakpoint
 * (`split-rail-base`, `xl:split-rail-xl`) that copies its own into `--split-rail`: a media query cannot
 * live in an inline style, and an inline `--split-rail` would beat every class, so in that case the
 * inline style carries only the lengths and the classes do the switching.
 */
function railWidthOf(railWidth: Responsive<number | string>): { style: SplitStyle; classes: string[] } {
  const entries = responsiveEntries(railWidth);

  if (entries.every(([ breakpoint ]) => breakpoint === 'base')) {
    return { style: { '--split-rail': toLength(entries[0]?.[1] ?? DEFAULT_RAIL_WIDTH) }, classes: [] };
  }

  const style: Record<string, string> = { '--split-rail-base': DEFAULT_RAIL_WIDTH };
  const classes: string[] = [ 'split-rail-base' ];

  for (const [ breakpoint, width ] of entries) {
    style[`--split-rail-${breakpoint}`] = toLength(width);

    if (breakpoint !== 'base') {
      classes.push(`${breakpointPrefix(breakpoint)}split-rail-${breakpoint}`);
    }
  }

  return { style: style as SplitStyle, classes };
}

/**
 * The columns of the frame and the display of the rail at every breakpoint where either changes: one
 * column while collapsed or while the rail is hidden, the two pane template otherwise.
 */
function layoutOf(
  template: string,
  collapseBelow: MediaBreakpoint | undefined,
  railHide: Responsive<boolean> | undefined
): { frame: string[]; rail: string[] } {
  const hideMap = toResponsiveMap(railHide);
  const collapseIndex = collapseBelow === undefined ? -1 : BREAKPOINTS.indexOf(collapseBelow);
  const frame: string[] = [];
  const rail: string[] = [];
  let hidden = false;
  let lastColumns: string | undefined;
  let lastDisplay: string | undefined;

  BREAKPOINTS.forEach((breakpoint: Breakpoint, index) => {
    hidden = hideMap[breakpoint] ?? hidden;

    const columns = hidden || index < collapseIndex ? 'grid-cols-1' : template;
    const display = hidden ? 'hidden' : 'contents';

    if (columns !== lastColumns) {
      frame.push(`${breakpointPrefix(breakpoint)}${columns}`);
      lastColumns = columns;
    }

    if (display !== lastDisplay) {
      rail.push(`${breakpointPrefix(breakpoint)}${display}`);
      lastDisplay = display;
    }
  });

  return { frame, rail };
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
    railHide,
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
  const layout = layoutOf(template, collapseBelow, railHide);
  const width = railWidthOf(railWidth);

  /** Wrapped only when it can hide: otherwise the rail is the grid item itself, as it always was */
  const railNode = railHide === undefined
    ? rail
    : <div data-slot={'split-rail'} className={cn(layout.rail, '*:min-w-0')}>{rail}</div>;


  // ----
  // Component Render
  // ----
  return (
    <Component
      data-slot={'split'}
      data-side={side}
      data-collapse-below={collapseBelow}
      className={cn(
        'grid *:min-w-0',
        layout.frame,
        width.classes,
        gap === undefined ? DEFAULT_GAP_CLASS.split : gapClasses(gap),
        baseClasses,
        className
      )}
      style={{ ...width.style, ...style }}
      {...rest}
    >
      {side === 'start' && railNode}
      {children}
      {side === 'end' && railNode}
    </Component>
  );

}

Split.displayName = 'Split';
