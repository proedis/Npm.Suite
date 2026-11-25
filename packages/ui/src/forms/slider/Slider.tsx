'use client';

import * as React from 'react';

import { bindable } from '../../core/binding';

import { SliderField } from './sliderField';

import type { BoundValue } from '../../core/binding';

import type { CommonSliderProps } from './sliderField';


/* --------
 * Types Definition
 * -------- */

export type { CommonSliderProps, SliderVariant } from './sliderField';

export interface SliderProps extends CommonSliderProps {
  value?: number;
  defaultValue?: number;

  /** Every change, while dragging too */
  onValueChange?: (value: number) => void;

  /** The value once the pointer is released or the key is up: where a request belongs */
  onValueCommitted?: (value: number) => void;
}


/* --------
 * Component Definition
 * -------- */

/**
 * One number picked on a scale, by dragging or with the arrows. A pair of numbers is `RangeSlider`.
 *
 * ```tsx
 * <Slider label={'Width'} variant={'field'} min={1} max={6} value={width} onValueChange={setWidth} />
 * ```
 *
 * Two looks: `track`, the label and the value above a line with a thumb, and `field`, a bar as tall as a
 * control filled up to the value, with the label inside and the value at its end, so it lines up with the
 * fields of a row. A scale of twelve steps or fewer shows a dot at each step. The value is written by
 * `Intl.NumberFormat` (`format`, `locale`), and `valueText` puts words around it. On Base UI's Slider:
 * the arrows move by a step, Page Up and Down by `largeStep`, Home and End to the ends; it reads its
 * name from a `Field` or from `label`.
 *
 * Parts with a slot: `slider` (with `data-variant`, `data-size`, `data-dragging`, `data-disabled`),
 * `slider-header`, `slider-label`, `slider-value`, `slider-control`, `slider-track`, `slider-indicator`,
 * `slider-thumb`, `slider-tick`, `slider-content`.
 */
function SliderBase(props: SliderProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { defaultValue, onValueChange, onValueCommitted, value: valueProp, ...rest } = props;


  // ----
  // Internal State
  // ----
  const [ own, setOwn ] = React.useState(defaultValue ?? rest.min ?? 0);
  const value = valueProp ?? own;


  // ----
  // Component Render
  // ----
  return (
    <SliderField
      {...rest}
      dataSlot={'slider'}
      values={[ value ]}
      onValuesChange={([ next ]) => {
        setOwn(next);
        onValueChange?.(next);
      }}
      onValuesCommitted={([ next ]) => onValueCommitted?.(next)}
    />
  );

}

SliderBase.displayName = 'Slider';

/** Bound to a form through `binding`: a number, so the bounds of a schema reach it */
export const Slider = bindable(SliderBase, {
  kind: 'number',
  bind: (field: BoundValue<number>, props) => ({
    name            : field.name,
    value           : field.value ?? (props.min as number | undefined) ?? 0,
    onValueChange   : field.onChange,
    onValueCommitted: () => field.onBlur()
  })
});
