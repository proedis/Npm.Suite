import * as React from 'react';

import { splitBaseProps } from '../lib/base';
import { cn } from '../lib/cn';

import type { PolymorphicProps } from '../lib/polymorphic';

import type { BaseProps } from '../lib/base';


/* --------
 * Types Definition
 * -------- */
export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';


export interface StrictContainerProps extends BaseProps {
  /** Horizontal padding that grows with the viewport. On by default */
  padded?: boolean;

  /** How wide the content may get */
  size?: ContainerSize;

}


export type ContainerProps<E extends React.ElementType = 'div'> = PolymorphicProps<E, StrictContainerProps>;


/* --------
 * Constants Definition
 * -------- */
const SIZE: Record<ContainerSize, string> = {
  full: 'max-w-none',
  lg  : 'max-w-7xl',
  md  : 'max-w-5xl',
  sm  : 'max-w-3xl',
  xl  : 'max-w-8xl'
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
    size = 'lg',
    ...others
  } = props as ContainerProps<'div'>;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Component Render
  // ----
  return (
    <Component
      data-slot={'container'}
      className={cn('mx-auto w-full', SIZE[size], padded && 'px-4 sm:px-6 lg:px-8', baseClasses, className)}
      {...rest}
    />
  );

}

Container.displayName = 'Container';
