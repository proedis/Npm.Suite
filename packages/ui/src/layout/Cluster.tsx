import * as React from 'react';

import { splitBaseProps } from '../core/base';
import { cn } from '../core/cn';
import { alignClasses, gapClasses, justifyClasses } from '../core/responsive';

import { DEFAULT_GAP_CLASS } from './defaultGap';
import { layoutAttributes } from './layoutAttributes';

import type { BaseProps } from '../core/base';
import type { PolymorphicProps } from '../core/polymorphic';
import type { Align, Justify, Responsive, Spacing } from '../core/responsive';


/* --------
 * Types Definition
 * -------- */
export interface StrictClusterProps extends BaseProps {
  /** Cross-axis alignment. Defaults to `center` */
  align?: Responsive<Align>;

  /** Space between items: a step of the spacing scale by name, or a Tailwind spacing step by number.
   * Defaults to `sm`, moved by the theme with `--cluster-gap` */
  gap?: Responsive<Spacing>;

  /** Main-axis distribution. Defaults to `start` */
  justify?: Responsive<Justify>;

  /** Sits in a line of text like a word: `inline-flex` */
  inline?: boolean;

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
    gap,
    inline = false,
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
      {...layoutAttributes(rest, { 'data-inline': inline || undefined })}
      className={cn(inline ? 'inline-flex' : 'flex', 'flex-wrap', gap === undefined ? DEFAULT_GAP_CLASS.cluster : gapClasses(gap), alignClasses(align), justifyClasses(justify), baseClasses, className)}
      {...rest}
    />
  );

}

Cluster.displayName = 'Cluster';
