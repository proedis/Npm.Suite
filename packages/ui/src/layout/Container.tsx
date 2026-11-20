import * as React from 'react';

import { splitBaseProps } from '../core/base';
import { cn } from '../core/cn';

import type { BaseProps } from '../core/base';
import type { PolymorphicProps } from '../core/polymorphic';


/* --------
 * Types Definition
 * -------- */
export type ContainerSize = 'default' | 'sm' | 'md' | 'lg' | 'xl' | 'full';


export interface StrictContainerProps extends BaseProps {
  /** Horizontal padding that grows with the viewport. On by default */
  padded?: boolean;

  /**
   * How wide the content may get.
   *
   * `default` is a value of its own and the one you get by saying nothing, so
   * `[data-slot='container'][data-size='default']` is exactly the set of pages nobody had an opinion
   * about — and an application's rule for it keeps working if this package ever changes its mind about
   * which step that is.
   */
  size?: ContainerSize;

}


export type ContainerProps<E extends React.ElementType = 'div'> = PolymorphicProps<E, StrictContainerProps>;


/* --------
 * Constants Definition
 * -------- */
/** The house page width, in one place, so `default` and the step it equals cannot drift apart */
const DEFAULT_SIZE_CLASS = 'max-w-7xl';

const SIZE: Record<ContainerSize, string> = {
  default: DEFAULT_SIZE_CLASS,
  full   : 'max-w-none',
  lg     : DEFAULT_SIZE_CLASS,
  md     : 'max-w-5xl',
  sm     : 'max-w-3xl',
  xl     : 'max-w-8xl'
};


/* --------
 * Component Definition
 * -------- */

/**
 * The centred, width-capped page wrapper. Constrains the content; the layout inside is a `Stack` or
 * a `Grid`.
 */
export function Container<E extends React.ElementType = 'div'>(props: ContainerProps<E>): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    as: Component = 'div',
    className,
    padded = true,
    size = 'default',
    ...others
  } = props as ContainerProps<'div'>;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Component Render
  // ----
  return (
    <Component
      data-slot={'container'}
      data-size={size}
      data-padded={padded || undefined}
      className={cn('mx-auto w-full', SIZE[size], padded && 'px-4 sm:px-6 lg:px-8', baseClasses, className)}
      {...rest}
    />
  );

}

Container.displayName = 'Container';
