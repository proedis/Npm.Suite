'use client';

import * as React from 'react';

import { bindable } from '../../core/binding';

import { SliderField } from '../slider/sliderField';

import type { BoundValue } from '../../core/binding';

import type { CommonSliderProps } from '../slider/sliderField';


/* --------
 * Types Definition
 * -------- */

export type { CommonSliderProps, SliderVariant } from '../slider/sliderField';

/** The two ends of a range, the lower first */
export type SliderRange = readonly [number, number];

export interface RangeSliderLabels {
  /** The name of the thumb of the lower end: "Minimum weight" */
  readonly start: string;

  /** The name of the thumb of the upper end: "Maximum weight" */
  readonly end: string;
}

export interface RangeSliderProps extends Omit<CommonSliderProps, 'valueText'> {
  value?: SliderRange;
  defaultValue?: SliderRange;

  /** Every change, while dragging too */
  onValueChange?: (value: SliderRange) => void;

  /** The value once the pointer is released or the key is up: where a request belongs */
  onValueCommitted?: (value: SliderRange) => void;

  /** How many steps the two ends keep between them. Defaults to 0: they may meet */
  minStepsBetweenValues?: number;

  /** The names of the two thumbs, required: each is a control of its own */
  labels: RangeSliderLabels;
}


/* --------
 * Component Definition
 * -------- */

/**
 * Two numbers on a scale, the ends of a range: a weight from and to, a price between. The single value is
 * `Slider`, with which it shares the two looks, the dots of the steps and the formatting.
 *
 * ```tsx
 * <RangeSlider label={'Load'} min={0} max={20} value={load} onValueChange={setLoad} labels={{ start: 'From', end: 'To' }} />
 * ```
 *
 * Each thumb is a control with a name of its own, from `labels`. The ends never cross: a thumb pushes
 * the other when they meet, and `minStepsBetweenValues` keeps them apart. The value is written as the two
 * numbers, "4 – 12".
 *
 * Parts with a slot: those of `Slider`, with `range-slider` in place of `slider`.
 */
function RangeSliderBase(props: RangeSliderProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { defaultValue, labels, onValueChange, onValueCommitted, value: valueProp, ...rest } = props;


  // ----
  // Internal State
  // ----
  const [ own, setOwn ] = React.useState<SliderRange>(defaultValue ?? [ rest.min ?? 0, rest.max ?? 100 ]);
  const value = valueProp ?? own;


  // ----
  // Component Render
  // ----
  return (
    <SliderField
      {...rest}
      dataSlot={'range-slider'}
      values={value}
      thumbLabels={[ labels.start, labels.end ]}
      onValuesChange={(next) => {
        const range: SliderRange = [ next[0], next[1] ];

        setOwn(range);
        onValueChange?.(range);
      }}
      onValuesCommitted={(next) => onValueCommitted?.([ next[0], next[1] ])}
    />
  );

}

RangeSliderBase.displayName = 'RangeSlider';

/** Bound to a form through `binding`: two numbers, each within the bounds of a schema */
export const RangeSlider = bindable(RangeSliderBase, {
  kind: 'number',
  bind: (field: BoundValue<SliderRange>, props) => ({
    name            : field.name,
    value           : field.value ?? [ (props.min as number | undefined) ?? 0, (props.max as number | undefined) ?? 100 ],
    onValueChange   : field.onChange,
    onValueCommitted: () => field.onBlur()
  })
});
