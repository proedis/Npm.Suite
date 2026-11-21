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

import { layoutAttributes } from './layoutAttributes';

import type { BaseProps } from '../core/base';
import type { PolymorphicProps } from '../core/polymorphic';
import type { Align, ColumnsValue, Direction, Justify, Responsive, Spacing } from '../core/responsive';


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

  /**
   * Sits in a line of text like a word: `inline-flex`, or `inline-grid` with `columns`.
   *
   * For an icon beside its word in a sentence, align on the `baseline` and centre the icon on its own
   * (`self-center`). An inline box takes its baseline from its first child, and an icon has none: with
   * `align={'center'}` the browser uses the bottom of the icon, and the word rises off the line.
   */
  inline?: boolean;

  /**
   * Space between children: a step of the spacing scale by name, or a Tailwind spacing step by number. Defaults to `md`.
   *
   * Declare `0` for children that touch: a stack with no gap is a decision, and it reads as one.
   */
  gap?: Responsive<Spacing>;

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
 * <Stack>…</Stack>                                   // gap `md`
 * <Stack direction={{ base: 'vertical', lg: 'horizontal' }} gap={{ base: 'sm', lg: 'lg' }} divided>…</Stack>
 * <Stack columns={{ base: 1, md: 3 }} gap={'lg'}>…</Stack>
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
    gap = 'md',
    inline = false,
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
      ? [ inline ? 'inline-grid' : 'grid', ...columnsClasses(columns) ]
      : [ inline ? 'inline-flex' : 'flex', ...directionClasses(direction), wrap && 'flex-wrap' ]),

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
      {...layoutAttributes(rest, {
        'data-mode'   : isGrid ? 'grid' : 'flex',
        'data-divided': divided || undefined,
        'data-inline' : inline || undefined,
        'data-wrap'   : wrap || undefined
      })}
      className={cn(classes, baseClasses, className)}
      {...rest}
    />
  );

}

Stack.displayName = 'Stack';
