import * as React from 'react';

import { splitBaseProps } from '../core/base';
import { cn } from '../core/cn';
import {
  alignClasses,
  columnsClasses,
  directionClasses,
  divideClasses,
  gapClasses,
  justifyClasses
} from '../core/responsive';

import type { BaseProps } from '../core/base';

import type { PolymorphicProps } from '../core/polymorphic';
import type { Align, ColumnsValue, Direction, Justify, Responsive, SpacingValue } from '../core/responsive';


/* --------
 * Types Definition
 * -------- */
export interface StrictStackProps extends BaseProps {
  /** Cross-axis alignment */
  align?: Responsive<Align>;

  /** Equal columns. Declaring it switches the stack to a grid, where `direction` no longer applies */
  columns?: Responsive<ColumnsValue>;

  /** The axis children are laid out along. Defaults to `vertical` */
  direction?: Responsive<Direction>;

  /** Draw a hairline between children, following the active axis */
  divided?: boolean;

  /** Space between children, in Tailwind spacing steps */
  gap?: Responsive<SpacingValue>;

  /** Main-axis distribution */
  justify?: Responsive<Justify>;

  /** Let a horizontal stack wrap onto several lines */
  wrap?: boolean;
}


export type StackProps<E extends React.ElementType = 'div'> = PolymorphicProps<E, StrictStackProps>;


/* --------
 * Component Definition
 * -------- */

/**
 * The workhorse: children on an axis, with a responsive direction, gap and optional dividers.
 *
 * ```tsx
 * <Stack gap={4}>…</Stack>
 * <Stack direction={{ base: 'vertical', lg: 'horizontal' }} gap={{ base: 2, lg: 6 }} divided>…</Stack>
 * <Stack columns={{ base: 1, md: 3 }} gap={4}>…</Stack>
 * ```
 *
 * Declaring `columns` turns it into a grid of equal columns; `direction` is then meaningless and
 * ignored.
 */
export function Stack<E extends React.ElementType = 'div'>(props: StackProps<E>): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    align,
    as: Component = 'div',
    className,
    columns,
    direction = 'vertical',
    divided = false,
    gap,
    justify,
    wrap = false,
    ...others
  } = props as StackProps<'div'>;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Layout Computation
  // ----
  const isGrid = columns !== undefined && columns !== null;

  const classes = [
    ...(isGrid
      ? [ 'grid', ...columnsClasses(columns) ]
      : [ 'flex', ...directionClasses(direction), wrap && 'flex-wrap' ]),

    ...gapClasses(gap),

    /** In grid mode the rules ride the column axis, because there is no single direction to follow */
    ...(divided ? [ 'divide-border', ...(isGrid ? [ 'divide-x' ] : divideClasses(direction)) ] : []),

    ...alignClasses(align),
    ...justifyClasses(justify)
  ];


  // ----
  // Component Render
  // ----
  return (
    <Component
      data-slot={'stack'}
      data-mode={isGrid ? 'grid' : 'flex'}
      data-divided={divided || undefined}
      data-wrap={wrap || undefined}
      className={cn(classes, baseClasses, className)}
      {...rest}
    />
  );

}

Stack.displayName = 'Stack';
