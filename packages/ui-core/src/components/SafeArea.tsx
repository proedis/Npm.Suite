import * as React from 'react';

import { splitBaseProps } from '../lib/base';
import { cn } from '../lib/cn';

import type { PolymorphicProps } from '../lib/polymorphic';

import type { BaseProps } from '../lib/base';


/* --------
 * Types Definition
 * -------- */
export type SafeAreaSides = 'all' | 'top' | 'bottom' | 'horizontal' | 'vertical';


export interface StrictSafeAreaProps extends BaseProps {
  /** Which edges to keep clear of the device's own furniture. Defaults to all of them */
  sides?: SafeAreaSides;

}


export type SafeAreaProps<E extends React.ElementType = 'div'> = PolymorphicProps<E, StrictSafeAreaProps>;


/* --------
 * Constants Definition
 * -------- */

/** The custom utilities declared in the stylesheet, one per edge combination */
const SIDES: Readonly<Record<SafeAreaSides, string>> = {
  all       : 'p-safe',
  bottom    : 'pb-safe',
  horizontal: 'px-safe',
  top       : 'pt-safe',
  vertical  : 'py-safe'
};


/* --------
 * Component Definition
 * -------- */

/**
 * Pads its content out of the notch, the home indicator and the rounded corners of a device.
 *
 * ```tsx
 * <SafeArea sides={'bottom'}>
 *   <Cluster justify={'between'}>…</Cluster>   // a bottom bar that clears the home indicator
 * </SafeArea>
 * ```
 *
 * The padding comes from the `env(safe-area-inset-*)` variables the platform sets, through the
 * `*-safe` utilities this package declares — an arbitrary value in a class is not an option, and a
 * declared utility is better anyway: it is one name for a technique that is otherwise retyped at
 * every edge.
 *
 * ⚠️ Those variables are **zero** until the document opts into the full viewport. Without
 * `viewport-fit=cover` in the viewport meta tag this component renders no padding at all and looks
 * like it does nothing:
 *
 * ```html
 * <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
 * ```
 */
export function SafeArea<E extends React.ElementType = 'div'>(props: SafeAreaProps<E>): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    as: Component = 'div',
    className,
    sides = 'all',
    ...others
  } = props as SafeAreaProps<'div'>;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Component Render
  // ----
  return (
    <Component
      data-slot={'safe-area'}
      className={cn(SIDES[sides], baseClasses, className)}
      {...rest}
    />
  );

}

SafeArea.displayName = 'SafeArea';
