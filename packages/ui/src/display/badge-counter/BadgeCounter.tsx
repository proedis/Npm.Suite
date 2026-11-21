import * as React from 'react';

import { splitBaseProps } from '../../core/base';
import { cn } from '../../core/cn';
import { TONE_CLASSES } from '../../core/tone';

import { Stack } from '../../layout/Stack';

import type { BaseProps } from '../../core/base';


/* --------
 * Types Definition
 * -------- */

export type BadgeCounterTone = 'info' | 'destructive';

export interface BadgeCounterProps extends BaseProps {
  /** At 0 nothing renders */
  count: number;

  /** `destructive` when an error is among what is counted, `info` otherwise. The fill is the shape, not the urgency */
  tone: BadgeCounterTone;

  /** Past it the pill says "9+". Defaults to 9 */
  max?: number;

  className?: string;
}


/* --------
 * Constants Definition
 * -------- */

const TONES: Readonly<Record<BadgeCounterTone, string>> = {
  info       : TONE_CLASSES.solid.info,
  destructive: TONE_CLASSES.solid.destructive
};


/* --------
 * Component Definition
 * -------- */

/**
 * The count over an icon-only button: "3" on the bell of a panel, "9+" past nine.
 *
 * ```tsx
 * <span className={'relative inline-flex'}>
 *   <IconButton label={'Jobs'} icon={<Bell />} aria-describedby={'jobs-count'} />
 *   <BadgeCounter count={3} tone={'info'} />
 * </span>
 * <span id={'jobs-count'} hidden>3 to look at</span>
 * ```
 *
 * The pill is `aria-hidden`: the button's name stays fixed ("Jobs") so voice commands find it, and
 * the count reaches a screen reader through the button's `aria-describedby`, which the caller words.
 * It sits on the top right corner of a `relative` parent, with a ring in the colour of the surface
 * that parts it from the button; the parent must not clip it.
 *
 * Parts with a slot: `badge-counter` (with `data-tone`).
 */
export function BadgeCounter(props: BadgeCounterProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    className,
    count,
    max = 9,
    tone,
    ...others
  } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Component Render
  // ----
  if (count <= 0) {
    return null;
  }

  return (
    <Stack
      gap={0}
      as={'span'}
      aria-hidden
      data-slot={'badge-counter'}
      data-tone={tone}
      inline
      direction={'horizontal'}
      align={'center'}
      justify={'center'}
      className={cn(
        'pointer-events-none absolute -end-1.5 -top-1.5 h-4 min-w-4 rounded-full px-1',
        'text-xs leading-none font-semibold tabular-nums ring-2 ring-card select-none',
        'print:print-exact forced-colors:border forced-colors:border-solid',
        TONES[tone],
        baseClasses,
        className
      )}
      {...rest}
    >
      {count > max ? `${max}+` : count}
    </Stack>
  );

}

BadgeCounter.displayName = 'BadgeCounter';
