import * as React from 'react';

import { cn } from '../lib/cn';
import { gapClasses } from '../lib/responsive';

import type { Responsive, SpacingValue } from '../lib/responsive';

import type { StackAlign, StackJustify } from './Stack';


/* --------
 * Types Definition
 * -------- */
export interface ClusterProps extends React.ComponentProps<'div'> {
  align?: StackAlign;

  /** Space between items, in Tailwind spacing steps */
  gap?: Responsive<SpacingValue>;

  justify?: StackJustify;

  /** Render as something else than a `div` */
  as?: React.ElementType;
}


/* --------
 * Constants Definition
 * -------- */
const ALIGN: Record<StackAlign, string> = {
  baseline: 'items-baseline',
  center  : 'items-center',
  end     : 'items-end',
  start   : 'items-start',
  stretch : 'items-stretch'
};

const JUSTIFY: Record<StackJustify, string> = {
  around : 'justify-around',
  between: 'justify-between',
  center : 'justify-center',
  end    : 'justify-end',
  evenly : 'justify-evenly',
  start  : 'justify-start'
};


/* --------
 * Component Definition
 * -------- */

/**
 * A row that wraps: chips, tags, active filters, toolbar actions.
 *
 * It is a `Stack` with `direction="horizontal" wrap align="center"` baked in, and it exists as its
 * own name because that combination is where a hand-written `flex flex-wrap items-center gap-2`
 * keeps reappearing.
 */
export function Cluster(props: ClusterProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    align = 'center',
    as: Component = 'div',
    className,
    gap = 2,
    justify = 'start',
    ...rest
  } = props;


  // ----
  // Component Render
  // ----
  return (
    <Component
      data-slot={'cluster'}
      className={cn('flex flex-wrap', gapClasses(gap), ALIGN[align], JUSTIFY[justify], className)}
      {...rest}
    />
  );

}

Cluster.displayName = 'Cluster';
