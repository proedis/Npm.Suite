import * as React from 'react';

import { cn } from '../lib/cn';


/* --------
 * Types Definition
 * -------- */
export interface CenterProps extends React.ComponentProps<'div'> {
  /** Use `inline-flex`, so the box sits in a line of text instead of taking the row */
  inline?: boolean;

  /** Constrain the centred content to a readable column. Any CSS length, or pixels as a number */
  maxWidth?: number | string;

  /** Give the box room to centre within. Any CSS length, or pixels as a number */
  minHeight?: number | string;

  /** Render as something else than a `div` */
  as?: React.ElementType;
}


/* --------
 * Component Definition
 * -------- */

/**
 * Centres its children on both axes.
 *
 * `minHeight` is what makes it useful for an empty state, a loader or an auth screen: without room
 * to centre within, centring is a no-op. `maxWidth` wraps the content in a column of its own, so the
 * text stays readable while the box keeps filling its parent.
 */
export function Center(props: CenterProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    as: Component = 'div',
    children,
    className,
    inline = false,
    maxWidth,
    minHeight,
    style,
    ...rest
  } = props;


  // ----
  // Component Render
  // ----
  return (
    <Component
      data-slot={'center'}
      className={cn(inline ? 'inline-flex' : 'flex', 'items-center justify-center', className)}
      style={{ ...(minHeight === undefined ? {} : { minHeight }), ...style }}
      {...rest}
    >
      {maxWidth === undefined
        ? children
        : <div data-slot={'center-content'} style={{ maxWidth, width: '100%' }}>{children}</div>}
    </Component>
  );

}

Center.displayName = 'Center';
