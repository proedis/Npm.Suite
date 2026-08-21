import * as React from 'react';

import { splitBaseProps } from '../lib/base';
import { cn } from '../lib/cn';

import type { PolymorphicProps } from '../lib/polymorphic';

import type { BaseProps } from '../lib/base';

import type { SpacingValue } from '../lib/responsive';


/* --------
 * Types Definition
 * -------- */
export interface StrictBleedProps extends BaseProps {
  /**
   * How far to pull out on each side, in Tailwind spacing steps.
   *
   * Left undeclared it mirrors `Container`'s own padding, which is the case this component exists
   * for. Declare it to escape a padding of your own.
   */
  inset?: SpacingValue;

}


export type BleedProps<E extends React.ElementType = 'div'> = PolymorphicProps<E, StrictBleedProps>;


/* --------
 * Constants Definition
 * -------- */

/**
 * `Container`'s horizontal padding, negated.
 *
 * ⚠️ This is a **copy** of the `px-4 sm:px-6 lg:px-8` in `Container`, and the two have to move
 * together: a bleed that undoes the wrong amount is off by a few pixels at one breakpoint only,
 * which is the kind of defect that survives review. There is no way to derive one from the other in
 * CSS, so it is stated here instead of being discovered later.
 */
const CONTAINER_INSET = '-mx-4 sm:-mx-6 lg:-mx-8';


/* --------
 * Component Definition
 * -------- */

/**
 * Escapes the horizontal padding of its parent, so a band can reach the edge inside a padded page.
 *
 * ```tsx
 * <Container>
 *   <h1>Report</h1>
 *   <Bleed><Chart /></Bleed>   // full width, while the text stays in the column
 * </Container>
 * ```
 *
 * Horizontal only, on purpose: the vertical case is a margin a caller can write, while this one is
 * the pair of a padding it cannot see. A negative margin is the only technique that works without
 * knowing the parent's width.
 */
export function Bleed<E extends React.ElementType = 'div'>(props: BleedProps<E>): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    as: Component = 'div',
    className,
    inset,
    ...others
  } = props as BleedProps<'div'>;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Component Render
  // ----
  return (
    <Component
      data-slot={'bleed'}
      className={cn(inset === undefined ? CONTAINER_INSET : `-mx-${inset}`, baseClasses, className)}
      {...rest}
    />
  );

}

Bleed.displayName = 'Bleed';
