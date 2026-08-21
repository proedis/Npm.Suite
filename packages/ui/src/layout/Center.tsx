import * as React from 'react';

import { splitBaseProps } from '../core/base';
import { cn } from '../core/cn';

import type { PolymorphicProps } from '../core/polymorphic';

import type { BaseProps } from '../core/base';


/* --------
 * Types Definition
 * -------- */
export interface StrictCenterProps extends BaseProps {
  /** Use `inline-flex`, so the box sits in a line of text instead of taking the row */
  inline?: boolean;

  /** Constrain the centred content to a readable column. Any CSS length, or pixels as a number */
  maxWidth?: number | string;

  /** Give the box room to centre within. Any CSS length, or pixels as a number */
  minHeight?: number | string;

}


export type CenterProps<E extends React.ElementType = 'div'> = PolymorphicProps<E, StrictCenterProps>;


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
export function Center<E extends React.ElementType = 'div'>(props: CenterProps<E>): React.ReactNode {

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
    ...others
  } = props as CenterProps<'div'>;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Component Render
  // ----
  return (
    <Component
      data-slot={'center'}
      data-inline={inline || undefined}
      className={cn(inline ? 'inline-flex' : 'flex', 'items-center justify-center', baseClasses, className)}
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
