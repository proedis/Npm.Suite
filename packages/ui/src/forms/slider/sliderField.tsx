'use client';

import * as React from 'react';

import { Slider as SliderPrimitive } from '@base-ui/react/slider';

import { splitBaseProps } from '../../core/base';
import { cn } from '../../core/cn';

import { Stack } from '../../layout/Stack';

import { CONTROL_HEIGHT } from '../../internal/control';

import { useFieldControl } from '../field/fieldContext';

import type { BaseProps } from '../../core/base';
import type { ControlSize } from '../../core/control';


/*
 * The slider behind Slider and RangeSlider: one implementation on Base UI's Slider, which owns the
 * dragging, the keys, the hidden inputs and the values, in the two looks Marco asked for. Private to the
 * package, reached by relative path; the public components are thin, each with its own value.
 */


/* --------
 * Types Definition
 * -------- */

/**
 * `track`: the label and the value above a line with a thumb on it. `field`: a bar as tall as a control,
 * filled up to the value, the label inside it on the left and the value on the right, so it sits in a
 * row of fields
 */
export type SliderVariant = 'track' | 'field';

/** What a single value and a period of values share: everything but the value itself */
export interface CommonSliderProps extends BaseProps {
  /** The name, shown: above the line in `track`, inside the bar in `field`. In a `Field`, its label names it */
  label?: React.ReactNode;

  /** Defaults to `track` */
  variant?: SliderVariant;

  /** The height of a `field` bar, the thickness of a `track` line. Defaults to `md` */
  size?: ControlSize;

  /** Defaults to 0 */
  min?: number;

  /** Defaults to 100 */
  max?: number;

  /** Defaults to 1 */
  step?: number;

  /** The step of Page Up, Page Down and Shift with an arrow. Defaults to 10 */
  largeStep?: number;

  /** How the value is written, with `Intl.NumberFormat`: a unit, a currency, decimals */
  format?: Intl.NumberFormatOptions;

  /** The language of the numbers. Defaults to the page's */
  locale?: Intl.LocalesArgument;

  /** Writes the value in words around the formatted number: `(text) => \`${text} stops\`` */
  valueText?: (formatted: string, value: number) => React.ReactNode;

  /** The value is written; `false` hides it. Defaults to `true` */
  showValue?: boolean;

  /**
   * A dot at every step. Defaults to `true` when there are twelve steps or fewer, the scale a reader can
   * count, and `false` past that
   */
  ticks?: boolean;

  disabled?: boolean;

  /** The name the value is submitted with, in a `<form>` */
  name?: string;

  /** The name for assistive technology when no `label` is shown and no `Field` names it */
  'aria-label'?: string;

  className?: string;
}

export interface SliderFieldProps extends CommonSliderProps {
  values: readonly number[];
  onValuesChange: (values: readonly number[]) => void;
  onValuesCommitted?: (values: readonly number[]) => void;

  /** The names of the two thumbs of a range */
  thumbLabels?: readonly [string, string];

  /** How many steps the two thumbs of a range keep between them */
  minStepsBetweenValues?: number;

  dataSlot: string;
}


/* --------
 * Constants Definition
 * -------- */

/** Twelve steps or fewer: a scale a reader can count, so each step is a dot */
const COUNTABLE_STEPS = 12;

const RANGE_SEPARATOR = ' – ';

/** The thickness of the line and the size of the thumb of a `track` */
const TRACK_SIZES: Readonly<Record<ControlSize, { readonly line: string; readonly thumb: string }>> = {
  sm: { line: 'h-1', thumb: 'h-4 w-2.5' },
  md: { line: 'h-1.5', thumb: 'h-5 w-3' },
  lg: { line: 'h-2', thumb: 'h-6 w-3.5' }
};

/** The room inside a `field` bar, per size, the padding of a text field */
const FIELD_PADDING: Readonly<Record<ControlSize, string>> = {
  sm: 'px-2',
  md: 'px-2.5',
  lg: 'px-3'
};


/* --------
 * Component Definition
 * -------- */

export function SliderField(props: SliderFieldProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    'aria-label': ariaLabel,
    className,
    dataSlot,
    disabled = false,
    format,
    label,
    largeStep = 10,
    locale,
    max = 100,
    min = 0,
    minStepsBetweenValues,
    name,
    onValuesChange,
    onValuesCommitted,
    showValue = true,
    size = 'md',
    step = 1,
    thumbLabels,
    ticks: ticksProp,
    valueText,
    values,
    variant = 'track',
    ...others
  } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Internal Hooks
  // ----
  const field = useFieldControl();


  // ----
  // Component Render
  // ----
  const isRange = values.length > 1;
  const isDisabled = disabled || field.disabled;
  const stepCount = step > 0 ? Math.round((max - min) / step) : 0;
  const ticks = (ticksProp ?? stepCount <= COUNTABLE_STEPS) && stepCount > 1;

  const written = (
    <SliderPrimitive.Value data-slot={`${dataSlot}-value`} className={'shrink-0 tabular-nums'}>
      {(formatted, numbers) => (valueText && !isRange
        ? valueText(formatted[0] ?? '', numbers[0] ?? min)
        : formatted.join(RANGE_SEPARATOR))}
    </SliderPrimitive.Value>
  );

  const thumbs = values.map((_, index) => (
    <SliderPrimitive.Thumb
      key={index}
      index={isRange ? index : undefined}
      data-slot={`${dataSlot}-thumb`}
      aria-label={thumbLabels?.[index] ?? (label === undefined ? ariaLabel : undefined)}
      className={cn(
        'top-1/2 outline-none',
        variant === 'track'
          ? [
            'rounded-full border border-input bg-card shadow-sm',
            'has-focus-visible:outline-2 has-focus-visible:outline-solid has-focus-visible:outline-offset-2 has-focus-visible:outline-ring',
            TRACK_SIZES[size].thumb
          ]
          : [
            /* A short bar at the end of the fill: the reach of the press is the whole bar, not the handle */
            'h-1/2 w-3 after:absolute after:inset-y-0 after:start-1/2 after:w-0.5 after:-translate-x-1/2',
            'after:rounded-full after:bg-foreground/40 rtl:after:translate-x-1/2',
            'has-focus-visible:after:bg-ring has-focus-visible:after:w-1'
          ]
      )}
    />
  ));

  /* The filled stretch, in percent of the scale: a dot under it would show through the fill */
  const toPercent = (number: number): number => ((number - min) / (max - min)) * 100;
  const filledFrom = isRange ? toPercent(values[0]) : 0;
  const filledTo = toPercent(values[values.length - 1]);

  const tickMarks = ticks && Array.from({ length: stepCount - 1 }, (_, index) => ((index + 1) / stepCount) * 100)
    .filter((percent) => percent < filledFrom || percent > filledTo)
    .map((percent) => (
      <span
        key={percent}
        aria-hidden
        data-slot={`${dataSlot}-tick`}
        className={cn(
          'pointer-events-none absolute top-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full rtl:translate-x-1/2',
          variant === 'field' ? 'bg-muted-foreground/40' : 'bg-muted-foreground/30'
        )}
        style={{ insetInlineStart: `${percent}%` }}
      />
    ));

  return (
    <SliderPrimitive.Root
      {...rest}
      value={isRange ? values : values[0]}
      min={min}
      max={max}
      step={step}
      largeStep={largeStep}
      format={format}
      locale={locale}
      disabled={isDisabled}
      name={name}
      minStepsBetweenValues={minStepsBetweenValues}
      thumbAlignment={variant === 'field' ? 'edge' : 'center'}
      aria-label={label === undefined && !isRange ? ariaLabel : undefined}
      onValueChange={(next) => onValuesChange(typeof next === 'number' ? [ next ] : next)}
      onValueCommitted={(next) => onValuesCommitted?.(typeof next === 'number' ? [ next ] : next)}
      data-slot={dataSlot}
      data-variant={variant}
      data-size={size}
      render={<Stack gap={variant === 'track' ? 2 : 0} />}
      className={cn(
        'w-full min-w-0 touch-none select-none data-disabled:cursor-not-allowed data-disabled:opacity-50',
        baseClasses,
        className
      )}
    >
      {variant === 'track' && (label !== undefined || showValue) && (
        <Stack data-slot={`${dataSlot}-header`} gap={2} direction={'horizontal'} align={'center'} justify={'between'} className={'text-sm'}>
          {label !== undefined && (
            <SliderPrimitive.Label data-slot={`${dataSlot}-label`} className={'min-w-0 truncate font-medium text-foreground'}>
              {label}
            </SliderPrimitive.Label>
          )}
          {showValue && (
            <span className={'ms-auto rounded-sm bg-muted px-1.5 py-0.5 text-xs text-foreground'}>{written}</span>
          )}
        </Stack>
      )}

      {variant === 'track'
        ? (
          /* Base UI writes `position: relative` on the track: the control centres it in a column instead */
          <SliderPrimitive.Control
            data-slot={`${dataSlot}-control`}
            render={<Stack gap={0} justify={'center'} />}
            className={'h-6 w-full cursor-pointer data-disabled:cursor-not-allowed'}
          >
            <SliderPrimitive.Track data-slot={`${dataSlot}-track`} className={cn('w-full rounded-full bg-muted', TRACK_SIZES[size].line)}>
              {tickMarks}
              <SliderPrimitive.Indicator data-slot={`${dataSlot}-indicator`} className={'rounded-full bg-primary'} />
              {thumbs}
            </SliderPrimitive.Track>
          </SliderPrimitive.Control>
        )
        : (
          <SliderPrimitive.Control
            data-slot={`${dataSlot}-control`}
            className={cn(
              'relative w-full cursor-ew-resize overflow-hidden rounded-control bg-muted text-sm data-disabled:cursor-not-allowed',
              CONTROL_HEIGHT[size]
            )}
          >
            <SliderPrimitive.Track data-slot={`${dataSlot}-track`} className={'h-full w-full'}>
              {tickMarks}
              <SliderPrimitive.Indicator data-slot={`${dataSlot}-indicator`} className={'bg-foreground/10'} />
              {thumbs}
            </SliderPrimitive.Track>
            <Stack
              data-slot={`${dataSlot}-content`}
              direction={'horizontal'}
              align={'center'}
              justify={'between'}
              gap={2}
              className={cn('pointer-events-none absolute inset-0', FIELD_PADDING[size])}
            >
              {label !== undefined && (
                <SliderPrimitive.Label data-slot={`${dataSlot}-label`} className={'min-w-0 truncate text-muted-foreground'}>
                  {label}
                </SliderPrimitive.Label>
              )}
              {showValue && <span className={'ms-auto font-medium text-foreground'}>{written}</span>}
            </Stack>
          </SliderPrimitive.Control>
        )}
    </SliderPrimitive.Root>
  );

}
