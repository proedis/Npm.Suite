import * as React from 'react';

import { splitBaseProps } from '../core/base';
import { cn } from '../core/cn';

import type { PolymorphicProps } from '../core/polymorphic';

import type { BaseProps } from '../core/base';


/* --------
 * Types Definition
 * -------- */
export type ScrollOrientation = 'vertical' | 'horizontal' | 'both';


export interface StrictScrollAreaProps extends BaseProps {
  /** Cap the viewport, which is what gives the content something to scroll inside */
  maxHeight?: number | string;

  orientation?: ScrollOrientation;

}


export type ScrollAreaProps<E extends React.ElementType = 'div'> = PolymorphicProps<E, StrictScrollAreaProps>;


/* --------
 * Constants Definition
 * -------- */
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
      className={cn('scrollbar-thin min-h-0 min-w-0', OVERFLOW[orientation], baseClasses, className)}
      style={{ ...(maxHeight === undefined ? {} : { maxHeight }), ...style }}
      {...rest}
    />
  );

}

ScrollArea.displayName = 'ScrollArea';
