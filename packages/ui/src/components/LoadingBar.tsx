import * as React from 'react';

import { splitBaseProps } from '../core/base';
import { cn } from '../core/cn';

import type { BaseProps } from '../core/base';


/* --------
 * Types Definition
 * -------- */

export interface LoadingBarProps extends BaseProps {
  className?: string;
}


/* --------
 * Component Definition
 * -------- */

/**
 * The bar of a content already in view that is updating: a filter, an order or a page changed.
 *
 * ```tsx
 * <div aria-busy={wait.busy} className={'relative'}>
 *   {wait.visible && <LoadingBar className={'absolute inset-x-0 top-0'} />}
 *   <div className={cn(wait.visible && 'pointer-events-none opacity-70')}>…</div>
 * </div>
 * ```
 *
 * A 2px `primary-soft` track with a `primary` segment a third long, running left to right in 1.2s;
 * full and still with reduced motion. Hidden from screen readers: `aria-busy` on the container says
 * it. The caller places it, on the bottom line of the header, and dims the content to 70% without
 * making it `inert`, so the focus in a grid stays where it was. A background refresh shows nothing.
 *
 * Parts with a slot: `loading-bar`, `loading-bar-segment`.
 */
export function LoadingBar(props: LoadingBarProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { className, ...others } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Component Render
  // ----
  return (
    <span
      aria-hidden
      data-slot={'loading-bar'}
      className={cn('relative block h-0.5 w-full overflow-hidden bg-primary-soft', baseClasses, className)}
      {...rest}
    >
      <span
        data-slot={'loading-bar-segment'}
        className={'absolute inset-y-0 start-0 w-1/3 animate-loading-bar bg-primary motion-reduce:w-full motion-reduce:animate-none'}
      />
    </span>
  );

}

LoadingBar.displayName = 'LoadingBar';
