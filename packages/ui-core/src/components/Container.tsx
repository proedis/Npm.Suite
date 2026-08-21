import * as React from 'react';

import { cn } from '../lib/cn';


/* --------
 * Types Definition
 * -------- */
export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';


export interface ContainerProps extends React.ComponentProps<'div'> {
  /** Horizontal padding that grows with the viewport. On by default */
  padded?: boolean;

  /** How wide the content may get */
  size?: ContainerSize;

  /** Render as something else than a `div` */
  as?: React.ElementType;
}


/* --------
 * Constants Definition
 * -------- */
const SIZE: Record<ContainerSize, string> = {
  full: 'max-w-none',
  lg  : 'max-w-7xl',
  md  : 'max-w-5xl',
  sm  : 'max-w-3xl',
  xl  : 'max-w-[96rem]'
};


/* --------
 * Component Definition
 * -------- */

/**
 * The centred, width-capped page wrapper. Constrains the content; the layout inside is a `Stack` or
 * a `Grid`.
 */
export function Container(props: ContainerProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    as: Component = 'div',
    className,
    padded = true,
    size = 'lg',
    ...rest
  } = props;


  // ----
  // Component Render
  // ----
  return (
    <Component
      data-slot={'container'}
      className={cn('mx-auto w-full', SIZE[size], padded && 'px-4 sm:px-6 lg:px-8', className)}
      {...rest}
    />
  );

}

Container.displayName = 'Container';
