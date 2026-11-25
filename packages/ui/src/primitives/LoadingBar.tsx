import * as React from 'react';

import { splitBaseProps } from '../core/base';
import { cn } from '../core/cn';

import type { BaseProps } from '../core/base';
import type { Tone } from '../core/tone';


/* --------
 * Types Definition
 * -------- */

/** The height of the bar, in pixels */
export type LoadingBarLineWidth = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/** The corner of the bar and of its segment: the theme's (`--loading-bar-radius`, square undeclared), or a step */
export type LoadingBarRadius = 'default' | 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'full';

export interface LoadingBarProps extends BaseProps {
  className?: string;

  /** The tone of the track and of the segment: the soft fill and the solid fill of it. Defaults to `primary` */
  lineTone?: Tone;

  /** The height of the bar, in pixels, 1 to 8. Defaults to `2` */
  lineWidth?: LoadingBarLineWidth;

  /** The corner of the bar and of the segment running in it, `full` for a bar round at both ends. Defaults to `default` */
  radius?: LoadingBarRadius;
}


/* --------
 * Constants Definition
 * -------- */

const LINE_WIDTH: Readonly<Record<LoadingBarLineWidth, string>> = {
  1: 'h-px',
  2: 'h-0.5',
  3: 'h-0.75',
  4: 'h-1',
  5: 'h-1.25',
  6: 'h-1.5',
  7: 'h-1.75',
  8: 'h-2'
};

const RADIUS: Readonly<Record<LoadingBarRadius, string>> = {
  default: 'rounded-loading-bar',
  none   : 'rounded-none',
  xs     : 'rounded-xs',
  sm     : 'rounded-sm',
  md     : 'rounded-md',
  lg     : 'rounded-lg',
  full   : 'rounded-full'
};

/** The track is the soft fill of the tone, the segment its solid fill */
const LINE_TONE: Readonly<Record<Tone, { track: string; segment: string }>> = {
  muted      : { track: 'bg-muted', segment: 'bg-muted-foreground' },
  secondary  : { track: 'bg-secondary', segment: 'bg-secondary-foreground' },
  primary    : { track: 'bg-primary-soft', segment: 'bg-primary' },
  success    : { track: 'bg-success-soft', segment: 'bg-success' },
  warning    : { track: 'bg-warning-soft', segment: 'bg-warning' },
  destructive: { track: 'bg-destructive-soft', segment: 'bg-destructive' },
  info       : { track: 'bg-info-soft', segment: 'bg-info' }
};


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
 * `lineWidth` and `lineTone` change the height and the tone (`muted` and `secondary` draw the segment in
 * their ink, since their solid fill is a surface), `radius` the corner of the bar and of the segment;
 * full and still with reduced motion. Hidden from screen readers: `aria-busy` on the container says
 * it. The caller places it, on the bottom line of the header, and dims the content to 70% without
 * making it `inert`, so the focus in a grid stays where it was. A background refresh shows nothing.
 *
 * Parts with a slot: `loading-bar` (with `data-line-tone`, `data-line-width`, `data-radius`), `loading-bar-segment`.
 */
export function LoadingBar(props: LoadingBarProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { className, lineTone = 'primary', lineWidth = 2, radius = 'default', ...others } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Component Render
  // ----
  return (
    <span
      aria-hidden
      data-slot={'loading-bar'}
      data-line-tone={lineTone}
      data-line-width={lineWidth}
      data-radius={radius}
      className={cn(
        'relative block w-full overflow-hidden',
        LINE_WIDTH[lineWidth],
        RADIUS[radius],
        LINE_TONE[lineTone].track,
        baseClasses,
        className
      )}
      {...rest}
    >
      <span
        data-slot={'loading-bar-segment'}
        className={cn(
          'absolute inset-y-0 start-0 w-1/3 animate-loading-bar motion-reduce:w-full motion-reduce:animate-none',
          RADIUS[radius],
          LINE_TONE[lineTone].segment
        )}
      />
    </span>
  );

}

LoadingBar.displayName = 'LoadingBar';
