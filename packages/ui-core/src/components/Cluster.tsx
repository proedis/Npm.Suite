import * as React from 'react';

import { splitBaseProps } from '../lib/base';
import { cn } from '../lib/cn';
import { alignClasses, gapClasses, justifyClasses } from '../lib/responsive';

import type { PolymorphicProps } from '../lib/polymorphic';

import type { BaseProps } from '../lib/base';

import type { Align, Justify, Responsive, SpacingValue } from '../lib/responsive';


/* --------
 * Types Definition
 * -------- */
export interface StrictClusterProps extends BaseProps {
  /** Cross-axis alignment */
  align?: Responsive<Align>;

  /** Space between items, in Tailwind spacing steps */
  gap?: Responsive<SpacingValue>;

  /** Main-axis distribution */
  justify?: Responsive<Justify>;

}


export type ClusterProps<E extends React.ElementType = 'div'> = PolymorphicProps<E, StrictClusterProps>;


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
export function Cluster<E extends React.ElementType = 'div'>(props: ClusterProps<E>): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    align = 'center',
    as: Component = 'div',
    className,
    gap = 2,
    justify = 'start',
    ...others
  } = props as ClusterProps<'div'>;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Component Render
  // ----
  return (
    <Component
      data-slot={'cluster'}
      className={cn('flex flex-wrap', gapClasses(gap), alignClasses(align), justifyClasses(justify), baseClasses, className)}
      {...rest}
    />
  );

}

Cluster.displayName = 'Cluster';
