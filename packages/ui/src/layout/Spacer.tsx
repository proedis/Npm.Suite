import * as React from 'react';

import { splitBaseProps } from '../core/base';
import { cn } from '../core/cn';

import type { PolymorphicProps } from '../core/polymorphic';

import type { BaseProps } from '../core/base';


/* --------
 * Types Definition
 * -------- */
export interface StrictSpacerProps extends BaseProps {
}


export type SpacerProps<E extends React.ElementType = 'div'> = PolymorphicProps<E, StrictSpacerProps>;


/* --------
 * Component Definition
 * -------- */

/**
 * The flexible filler that pushes its siblings apart — left actions ←→ right actions in a toolbar.
 *
 * `aria-hidden`, because it carries nothing: it is layout, and a screen reader has no use for it.
 */
export function Spacer<E extends React.ElementType = 'div'>(props: SpacerProps<E>): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    as: Component = 'div',
    className,
    ...others
  } = props as SpacerProps<'div'>;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Component Render
  // ----
  return <Component aria-hidden data-slot={'spacer'} className={cn('flex-1 self-stretch', baseClasses, className)} {...rest} />;

}

Spacer.displayName = 'Spacer';
