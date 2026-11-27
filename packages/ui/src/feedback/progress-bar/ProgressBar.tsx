'use client';

import * as React from 'react';

import { Meter as MeterPrimitive } from '@base-ui/react/meter';
import { Progress as ProgressPrimitive } from '@base-ui/react/progress';

import { splitBaseProps } from '../../core/base';
import { cn } from '../../core/cn';

import { Stack } from '../../layout/Stack';

import { isPresent } from '../../internal/presence';

import type { BaseProps } from '../../core/base';
import type { Tone } from '../../core/tone';


/* --------
 * Types Definition
 * -------- */

/** The height of the track: 4, 6, 8, 16 or 24 pixels */
export type ProgressBarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/** The corner of the track and of the fill: the theme's (`--progress-radius`, round undeclared), or a step */
export type ProgressBarRadius = 'default' | 'none' | 'sm' | 'md' | 'lg' | 'full';

/** The ground under the fill: the theme's (`--progress-track`, `--muted` undeclared), the soft of the tone, or none */
export type ProgressBarTrack = 'default' | 'tone' | 'none';

/**
 * Where the value is written: over the bar at the end of the label (`top`), after the bar (`end`), inside
 * it (`inside`, from `lg`), in a bubble that follows the end of the fill (`floating`), or nowhere
 */
export type ProgressBarValuePosition = 'none' | 'top' | 'end' | 'inside' | 'floating';

/** The props a ProgressBar and a Meter share, apart from the size and the name */
export interface ProgressBarOwnProps extends BaseProps {
  /** The current value. `null` is a ProgressBar that cannot say how far it is: indeterminate */
  value: number | null;

  /** Defaults to 0 */
  min?: number;

  /** Defaults to 100 */
  max?: number;

  /** Defaults to `primary` */
  tone?: Tone;

  /** Defaults to `default` */
  radius?: ProgressBarRadius;

  /** Defaults to `default` */
  track?: ProgressBarTrack;

  /** The minimum and the maximum, written under the ends of the bar. Off by default */
  showBounds?: boolean;

  /**
   * How a number is written, the value and the bounds: `Intl.NumberFormat` options. Undeclared, a
   * percentage of the range, as Base UI writes it
   */
  format?: Intl.NumberFormatOptions;

  /** The locale of `format`. Defaults to the runtime's */
  locale?: Intl.LocalesArgument;

  /** What is written for the value, from the formatted number: "12 of 40 stops" */
  valueText?: (formattedValue: string, value: number) => React.ReactNode;

  /** What a screen reader hears for the value. Defaults to the formatted number */
  getAriaValueText?: (formattedValue: string, value: number | null) => string;

  /** What a screen reader hears for an indeterminate ProgressBar: "Waiting for the server" */
  indeterminateLabel?: string;

  className?: string;
}

/** Inside the bar only from `lg`: a smaller track has no room for a line of text */
type ProgressBarSizing =
  | { size?: 'xs' | 'sm' | 'md'; valuePosition?: Exclude<ProgressBarValuePosition, 'inside'> }
  | { size: 'lg' | 'xl'; valuePosition?: ProgressBarValuePosition };

/** A bar has a name: the visible `label`, or `aria-label` / `aria-labelledby` when the page names it */
type ProgressBarNaming =
  | { label: React.ReactNode; 'aria-label'?: never; 'aria-labelledby'?: never }
  | { label?: never; 'aria-label': string; 'aria-labelledby'?: never }
  | { label?: never; 'aria-label'?: never; 'aria-labelledby': string };

export type StrictProgressBarProps = ProgressBarOwnProps & ProgressBarSizing & ProgressBarNaming;

export type ProgressBarProps = StrictProgressBarProps
  & Omit<React.ComponentProps<'div'>, keyof ProgressBarOwnProps | 'aria-label' | 'aria-labelledby' | 'children'>;

/** The same bar for a quantity in a range, which is never indeterminate */
export type StrictMeterProps = Omit<StrictProgressBarProps, 'value' | 'indeterminateLabel'> & { value: number };

export type MeterProps = Omit<ProgressBarProps, 'value' | 'indeterminateLabel'> & { value: number };

type ProgressKind = 'progress-bar' | 'meter';


/* --------
 * Constants Definition
 * -------- */

const DEFAULT_VARIANTS = {
  radius       : 'default',
  size         : 'md',
  tone         : 'primary',
  track        : 'default',
  valuePosition: 'top'
} as const;

const SIZE: Readonly<Record<ProgressBarSize, string>> = {
  xs: 'h-1',
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-4 text-2xs',
  xl: 'h-6 text-xs'
};

const RADIUS: Readonly<Record<ProgressBarRadius, string>> = {
  default: 'rounded-progress',
  none   : 'rounded-none',
  sm     : 'rounded-sm',
  md     : 'rounded-md',
  lg     : 'rounded-lg',
  full   : 'rounded-full'
};

/** The fill and the ink of a value written on it, per tone: the ink of `muted` and `secondary`, whose solid is a surface */
const FILL: Readonly<Record<Tone, { fill: string; ink: string; soft: string }>> = {
  muted      : { fill: 'bg-muted-foreground', ink: 'text-background', soft: 'bg-muted' },
  secondary  : { fill: 'bg-secondary-foreground', ink: 'text-secondary', soft: 'bg-secondary' },
  primary    : { fill: 'bg-primary', ink: 'text-primary-foreground', soft: 'bg-primary-soft' },
  success    : { fill: 'bg-success', ink: 'text-success-foreground', soft: 'bg-success-soft' },
  warning    : { fill: 'bg-warning', ink: 'text-warning-foreground', soft: 'bg-warning-soft' },
  destructive: { fill: 'bg-destructive', ink: 'text-destructive-foreground', soft: 'bg-destructive-soft' },
  info       : { fill: 'bg-info', ink: 'text-info-foreground', soft: 'bg-info-soft' }
};

/** The change of value is animated, a functional movement; at once under reduced motion */
const MOTION = 'transition-all duration-300 ease-out motion-reduce:transition-none';

const NUMBER = 'tabular-nums';


/* --------
 * Helpers
 * -------- */

/** Base UI's own rule: with `format` the value itself, without it the percentage of the range */
function formatNumber(
  value: number,
  min: number,
  max: number,
  format?: Intl.NumberFormatOptions,
  locale?: Intl.LocalesArgument
): string {
  if (format) {
    return new Intl.NumberFormat(locale, format).format(value);
  }

  return new Intl.NumberFormat(locale, { style: 'percent' }).format(max === min ? 0 : (value - min) / (max - min));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}


/* --------
 * Implementation
 * -------- */

/**
 * The one implementation behind `ProgressBar` and `Meter`: the same look on Base UI's `Progress` or `Meter`,
 * which differ only in what a screen reader is told (`progressbar` or `meter`).
 */
function ProgressImpl(props: ProgressBarProps & { kind: ProgressKind }): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    className,
    format,
    getAriaValueText,
    indeterminateLabel,
    kind,
    label,
    locale,
    max = 100,
    min = 0,
    radius = DEFAULT_VARIANTS.radius,
    showBounds = false,
    size = DEFAULT_VARIANTS.size,
    tone = DEFAULT_VARIANTS.tone,
    track = DEFAULT_VARIANTS.track,
    value,
    valuePosition = DEFAULT_VARIANTS.valuePosition,
    valueText,
    ...others
  } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Value Computation
  // ----
  const indeterminate = value === null || !Number.isFinite(value);
  const clamped = indeterminate ? min : clamp(value, min, max);
  const percentage = indeterminate || max === min ? 0 : ((clamped - min) / (max - min)) * 100;
  const formatted = indeterminate ? '' : formatNumber(clamped, min, max, format, locale);
  const shown = indeterminate ? null : (valueText ? valueText(formatted, clamped) : formatted);
  const position = indeterminate ? 'none' : valuePosition;
  const hasLabel = isPresent(label);
  const slot = (part?: string): string => (part ? `${kind}-${part}` : kind);
  const colours = FILL[tone];


  // ----
  // Component Render
  // ----
  const Primitive = kind === 'meter' ? MeterPrimitive : ProgressPrimitive;

  /* The two roots take the same props but for `value`, which a Meter never leaves `null`: one cast, here */
  const Root = Primitive.Root as typeof ProgressPrimitive.Root;

  /*
   * The widest the value gets, invisible: the column of a value after the bar does not move as it grows,
   * and the value sits at its end, as a number in a column does
   */
  const widest = formatNumber(max, min, max, format, locale);

  const endValue = (
    <Stack gap={0} data-slot={slot('value')} aria-hidden align={'end'} className={cn('shrink-0 text-sm font-medium text-foreground', NUMBER)}>
      <span>{shown}</span>
      <span className={'invisible h-0 overflow-hidden'}>{valueText ? valueText(widest, max) : widest}</span>
    </Stack>
  );

  const header = (hasLabel || position === 'top') && (
    <Stack gap={'sm'} data-slot={slot('header')} direction={'horizontal'} align={'baseline'} justify={'between'}>
      {hasLabel && (
        <Primitive.Label data-slot={slot('label')} className={'min-w-0 text-sm font-medium text-foreground'}>
          {label}
        </Primitive.Label>
      )}
      {position === 'top' && (
        <span data-slot={slot('value')} aria-hidden className={cn('ms-auto shrink-0 text-sm text-muted-foreground', NUMBER)}>
          {shown}
        </span>
      )}
    </Stack>
  );

  const bubble = position === 'floating' && (
    <div data-slot={slot('bubble-row')} aria-hidden className={'relative h-6'}>
      <span
        data-slot={slot('bubble')}
        /* A free measure: the end of the fill. Moved by its own share, so it never leaves the bar at either end */
        style={{ insetInlineStart: `${percentage}%`, transform: `translateX(-${percentage}%)` }}
        className={cn(
          'absolute bottom-1 rounded-md bg-foreground px-1.5 py-0.5 text-xs font-medium whitespace-nowrap text-background',
          NUMBER,
          MOTION
        )}
      >
        {shown}
      </span>
    </div>
  );

  /*
   * Inside: the value twice, centred on the whole track. Once in the ink of the track, once in the ink of the
   * fill, clipped by the fill: where the fill passes, the text changes colour with it, and it reads at 3% as at 97%
   */
  const inside = position === 'inside' && (
    <Stack gap={0} data-slot={slot('value')} aria-hidden align={'center'} justify={'center'} className={cn('absolute inset-0 font-medium text-foreground', NUMBER)}>
      {shown}
    </Stack>
  );

  const insideOnFill = position === 'inside' && percentage > 0 && (
    <Stack
      gap={0}
      aria-hidden
      data-slot={slot('value-on-fill')}
      align={'center'}
      justify={'center'}
      /* A free measure: as wide as the whole track, from inside a fill that is a share of it */
      style={{ width: `${10000 / percentage}%` }}
      className={cn('absolute inset-y-0 start-0 font-medium', colours.ink, NUMBER)}
    >
      {shown}
    </Stack>
  );

  const bounds = showBounds && (
    <Stack gap={'sm'} data-slot={slot('bounds')} aria-hidden direction={'horizontal'} justify={'between'} className={cn('text-xs text-muted-foreground', NUMBER)}>
      <span data-slot={slot('min')}>{formatNumber(min, min, max, format, locale)}</span>
      <span data-slot={slot('max')}>{formatNumber(max, min, max, format, locale)}</span>
    </Stack>
  );

  const bar = (
    <Primitive.Track
      data-slot={slot('track')}
      className={cn(
        'relative w-full min-w-0 overflow-hidden',
        SIZE[size],
        RADIUS[radius],
        track === 'default' && 'bg-progress-track',
        track === 'tone' && colours.soft,
        track === 'none' && 'bg-transparent'
      )}
    >
      {inside}
      <Primitive.Indicator
        data-slot={slot('indicator')}
        className={cn(
          'relative block h-full overflow-hidden',
          RADIUS[radius],
          colours.fill,
          MOTION,
          indeterminate && 'absolute inset-y-0 start-0 w-1/3 animate-loading-bar motion-reduce:w-full motion-reduce:animate-none'
        )}
      >
        {insideOnFill}
      </Primitive.Indicator>
    </Primitive.Track>
  );

  return (
    <Root
      {...rest}
      value={indeterminate ? null : value}
      min={min}
      max={max}
      format={format}
      locale={locale}
      getAriaValueText={getAriaValueText}
      /* Base UI's own text for an indeterminate bar is English: the caller's words, or none */
      {...(indeterminate ? { 'aria-valuetext': indeterminateLabel } : {})}
      render={<Stack gap={'xs'} />}
      data-slot={slot()}
      data-tone={tone}
      data-size={size}
      data-radius={radius}
      data-track={track}
      data-value-position={valuePosition}
      data-bounds={showBounds || undefined}
      className={cn('w-full min-w-0', baseClasses, className)}
    >
      {header}
      {bubble}
      {position === 'end'
        ? (
          <Stack gap={'sm'} direction={'horizontal'} align={'center'} data-slot={slot('row')}>
            {bar}
            {endValue}
          </Stack>
        )
        : bar}
      {bounds}
    </Root>
  );

}


/* --------
 * Component Definition
 * -------- */

/**
 * How far a piece of work has gone: an upload, an import, a round of stops. On Base UI's `Progress`, so a
 * screen reader hears a `progressbar` with its value.
 *
 * ```tsx
 * <ProgressBar label={'Stops covered'} value={29} max={38} />
 * <ProgressBar label={'Import'} value={null} indeterminateLabel={'Waiting for the server'} />
 * ```
 *
 * Everything is a prop or a variable of the theme: the size of the track (`xs` to `xl`), its corner
 * (`--progress-radius`, round), its ground (`--progress-track`, `--muted`, or the soft of the tone), the
 * seven tones, where the value is written (over the bar, after it, inside it from `lg`, in a bubble that
 * follows the fill), the bounds under its ends. A change of value slides, at once under reduced motion;
 * `null` runs a segment across, as a `LoadingBar` does.
 *
 * The numbers are written by `Intl.NumberFormat`: a percentage of the range by default, `format` for any
 * other, `valueText` around it for words ("12 of 40 stops"). No word ships in the component: an
 * indeterminate bar is heard through `indeterminateLabel`.
 *
 * For a quantity in a range that is not a piece of work (the load of a vehicle, the space used), `Meter`
 * is the same bar, heard as a `meter`.
 *
 * Slots: `progress-bar` (with `data-tone`, `data-size`, `data-radius`, `data-track`, `data-value-position`,
 * `data-bounds`, and Base UI's `data-complete`, `data-progressing`, `data-indeterminate`),
 * `progress-bar-header`, `progress-bar-label`, `progress-bar-value`, `progress-bar-value-on-fill`,
 * `progress-bar-bubble-row`, `progress-bar-bubble`, `progress-bar-row`, `progress-bar-track`,
 * `progress-bar-indicator`, `progress-bar-bounds`, `progress-bar-min`, `progress-bar-max`. A `Meter`
 * writes `meter` in their place.
 */
export function ProgressBar(props: ProgressBarProps): React.ReactNode {
  return <ProgressImpl {...props} kind={'progress-bar'} />;
}

ProgressBar.displayName = 'ProgressBar';


/**
 * A quantity in a range: the load of a vehicle, the space used, the share of a target. The look of
 * `ProgressBar`, on Base UI's `Meter`, so a screen reader hears a `meter`; never indeterminate.
 *
 * ```tsx
 * <Meter label={'Load'} value={14200} max={18000} format={{ style: 'unit', unit: 'kilogram' }} showBounds />
 * ```
 */
export function Meter(props: MeterProps): React.ReactNode {
  return <ProgressImpl {...(props as ProgressBarProps)} kind={'meter'} />;
}

Meter.displayName = 'Meter';
