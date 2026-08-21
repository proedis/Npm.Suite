import * as React from 'react';

import { cn } from '../lib/cn';


/* --------
 * Types Definition
 * -------- */
export interface SpacerProps extends React.ComponentProps<'div'> {
  /** Render as something else than a `div` */
  as?: React.ElementType;
}


/* --------
 * Component Definition
 * -------- */

/**
 * The flexible filler that pushes its siblings apart — left actions ←→ right actions in a toolbar.
 *
 * `aria-hidden`, because it carries nothing: it is layout, and a screen reader has no use for it.
 */
export function Spacer(props: SpacerProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    as: Component = 'div',
    className,
    ...rest
  } = props;


  // ----
  // Component Render
  // ----
  return <Component aria-hidden data-slot={'spacer'} className={cn('flex-1 self-stretch', className)} {...rest} />;

}

Spacer.displayName = 'Spacer';
