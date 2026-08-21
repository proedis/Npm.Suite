import * as React from 'react';

import { cn } from '../lib/cn';
import { columnsClasses, directionClasses, divideClasses, gapClasses } from '../lib/responsive';

import type { ColumnsValue, Direction, Responsive, SpacingValue } from '../lib/responsive';


/* --------
 * Types Definition
 * -------- */
export type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';

export type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';


export interface StackProps extends React.ComponentProps<'div'> {
  /** Cross-axis alignment */
  align?: StackAlign;

  /** Equal columns. Declaring it switches the stack to a grid, where `direction` no longer applies */
  columns?: Responsive<ColumnsValue>;

  /** The axis children are laid out along. Defaults to `vertical` */
  direction?: Responsive<Direction>;

  /** Draw a hairline between children, following the active axis */
  divided?: boolean;

  /** Space between children, in Tailwind spacing steps */
  gap?: Responsive<SpacingValue>;

  /** Main-axis distribution */
  justify?: StackJustify;

  /** Render as something else than a `div` */
  as?: React.ElementType;

  /** Let a horizontal stack wrap onto several lines */
  wrap?: boolean;
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
export function Stack(props: StackProps): React.ReactNode {

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
    ...rest
  } = props;


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

    align && ALIGN[align],
    justify && JUSTIFY[justify]
  ];


  // ----
  // Component Render
  // ----
  return <Component data-slot={'stack'} className={cn(classes, className)} {...rest} />;

}

Stack.displayName = 'Stack';
