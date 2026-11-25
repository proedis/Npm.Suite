import * as React from 'react';

import { splitBaseProps } from '../../core/base';
import { cn } from '../../core/cn';

import type { BaseProps } from '../../core/base';
import type { Tone } from '../../core/tone';


/* --------
 * Types Definition
 * -------- */

export type BadgeDotSize = 'xs' | 'sm' | 'md' | 'lg';

/** Where the dot sits: in the line of the text, or on a corner of the positioned parent */
export type BadgeDotPlacement = 'inline' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';

export interface StrictBadgeDotProps extends BaseProps {
  /** Defaults to `success` */
  tone?: Tone;

  /** 6, 8, 10 or 12 pixels. Defaults to `sm` */
  size?: BadgeDotSize;

  /** A ring that grows and fades around the dot, for a state that is live: online, recording, running */
  pulse?: boolean;

  /** A line of the card's colour around it, so a dot on a photo or an avatar keeps its edge */
  ring?: boolean;

  /** Defaults to `inline`. A corner needs a positioned parent (`relative`) */
  placement?: BadgeDotPlacement;

  /**
   * What the dot says, when nothing next to it says it: "Online". With it the dot is an image with that
   * name; without it, decoration hidden from assistive technology
   */
  label?: string;

  className?: string;
}

export type BadgeDotProps = StrictBadgeDotProps & Omit<React.ComponentProps<'span'>, keyof StrictBadgeDotProps | 'children'>;


/* --------
 * Constants Definition
 * -------- */

const DEFAULT_VARIANTS = {
  placement: 'inline',
  size     : 'sm',
  tone     : 'success'
} as const;

const SIZE: Readonly<Record<BadgeDotSize, string>> = {
  xs: 'size-1.5',
  sm: 'size-2',
  md: 'size-2.5',
  lg: 'size-3'
};

/**
 * The dot and its pulse, one colour: the solid of the tone, or the ink of `muted` and `secondary`,
 * whose solid is a surface a dot would not show on. Literal, so the scanner finds every class
 */
const TONE: Readonly<Record<Tone, string>> = {
  muted      : 'bg-muted-foreground before:bg-muted-foreground',
  secondary  : 'bg-secondary-foreground before:bg-secondary-foreground',
  primary    : 'bg-primary before:bg-primary',
  success    : 'bg-success before:bg-success',
  warning    : 'bg-warning before:bg-warning',
  destructive: 'bg-destructive before:bg-destructive',
  info       : 'bg-info before:bg-info'
};

const PLACEMENT: Readonly<Record<BadgeDotPlacement, string>> = {
  inline        : 'relative',
  'top-start'   : 'absolute start-0 top-0',
  'top-end'     : 'absolute end-0 top-0',
  'bottom-start': 'absolute start-0 bottom-0',
  'bottom-end'  : 'absolute end-0 bottom-0'
};

/** Tailwind's `ping`: a copy of the dot that doubles and fades. Still under reduced motion */
const PULSE = cn(
  'before:absolute before:inset-0 before:rounded-full before:animate-ping',
  'motion-reduce:before:animate-none motion-reduce:before:hidden'
);


/* --------
 * Component Definition
 * -------- */

/**
 * A dot of colour: a state with no words, next to a name or on the corner of an avatar.
 *
 * ```tsx
 * <BadgeDot tone={'success'} pulse label={'Online'} />
 * <Avatar kind={'person'} name={'Rossi Mario'} initials={'RM'} indicator={<BadgeDot pulse ring />} />
 * ```
 *
 * The colour is never the only carrier of the state: next to a text that says it, the dot is decoration
 * and hidden from assistive technology; alone, `label` gives it a name. `pulse` is for a state that is
 * happening now, and stands still with reduced motion; `ring` draws the card's colour around it, for a
 * dot over a photo.
 *
 * Parts with a slot: `badge-dot` (with `data-tone`, `data-size`, `data-placement`, `data-pulse`, `data-ring`).
 */
export function BadgeDot(props: BadgeDotProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    className,
    label,
    placement = DEFAULT_VARIANTS.placement,
    pulse = false,
    ring = false,
    size = DEFAULT_VARIANTS.size,
    tone = DEFAULT_VARIANTS.tone,
    ...others
  } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Component Render
  // ----
  return (
    <span
      {...(label === undefined ? { 'aria-hidden': true } : { role: 'img', 'aria-label': label })}
      data-slot={'badge-dot'}
      data-tone={tone}
      data-size={size}
      data-placement={placement}
      data-pulse={pulse || undefined}
      data-ring={ring || undefined}
      className={cn(
        'inline-block shrink-0 rounded-full',
        PLACEMENT[placement],
        SIZE[size],
        TONE[tone],
        pulse && PULSE,
        ring && 'ring-2 ring-card',
        'print:print-exact forced-colors:border forced-colors:border-solid',
        baseClasses,
        className
      )}
      {...rest}
    />
  );

}

BadgeDot.displayName = 'BadgeDot';
