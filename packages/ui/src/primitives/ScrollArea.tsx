import * as React from 'react';

import { splitBaseProps } from '../core/base';
import { cn } from '../core/cn';

import type { BaseProps } from '../core/base';
import type { PolymorphicProps } from '../core/polymorphic';


/* --------
 * Types Definition
 * -------- */
export type ScrollOrientation = 'vertical' | 'horizontal' | 'both';

/** How the scrollbar shows: always thin, only on hover or focus, or never */
export type ScrollbarVisibility = 'thin' | 'hover' | 'none';


export interface StrictScrollAreaProps extends BaseProps {
  /** Cap the viewport, which is what gives the content something to scroll inside */
  maxHeight?: number | string;

  orientation?: ScrollOrientation;

  /**
   * How the scrollbar shows. `thin`, the default, is a thin bar in the muted ink, on every system.
   * `hover` keeps it transparent until the pointer is over the area or the focus is inside it. `none`
   * draws none: the area still scrolls, so keep it for a strip whose overflow shows in its content.
   */
  scrollbar?: ScrollbarVisibility;

  /**
   * Keep the room of the scrollbar even while nothing overflows, so the content does not shift when it
   * starts to. Matters where the system reserves room for a scrollbar (Windows); an overlay scrollbar
   * takes none
   */
  stableGutter?: boolean;

}


export type ScrollAreaProps<E extends React.ElementType = 'div'> = PolymorphicProps<E, StrictScrollAreaProps>;


/* --------
 * Constants Definition
 * -------- */
const SCROLLBAR: Readonly<Record<ScrollbarVisibility, string>> = {
  thin : 'scrollbar-thin',
  hover: 'scrollbar-hover',
  none : 'scrollbar-none'
};

const OVERFLOW: Record<ScrollOrientation, string> = {
  both      : 'overflow-auto',
  horizontal: 'overflow-x-auto overflow-y-hidden',
  vertical  : 'overflow-y-auto overflow-x-hidden'
};


/* --------
 * Component Definition
 * -------- */

/**
 * A scroll container with a thin, themed scrollbar.
 *
 * Native overflow, no virtual scrollbar and no dependency: the browser keeps the momentum, the
 * keyboard behaviour and the accessibility for free, and the look comes from the `scrollbar-thin`
 * utility this package's stylesheet declares.
 *
 * `min-h-0 min-w-0` is not decoration — a flex child refuses to shrink below its content by default,
 * so without it the scroll never engages and the parent grows instead.
 */
export function ScrollArea<E extends React.ElementType = 'div'>(props: ScrollAreaProps<E>): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    as: Component = 'div',
    className,
    maxHeight,
    orientation = 'vertical',
    scrollbar = 'thin',
    stableGutter = false,
    style,
    ...others
  } = props as ScrollAreaProps<'div'>;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Component Render
  // ----
  return (
    <Component
      data-slot={'scroll-area'}
      data-orientation={orientation}
      data-scrollbar={scrollbar}
      className={cn(
        'min-h-0 min-w-0',
        SCROLLBAR[scrollbar],
        stableGutter && 'scrollbar-gutter-stable',
        OVERFLOW[orientation],
        baseClasses,
        className
      )}
      style={{ ...(maxHeight === undefined ? {} : { maxHeight }), ...style }}
      {...rest}
    />
  );

}

ScrollArea.displayName = 'ScrollArea';
