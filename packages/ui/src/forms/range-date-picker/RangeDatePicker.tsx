'use client';

import * as React from 'react';

import { bindable } from '../../core/binding';

import { DatePickerField } from '../date-picker/datePickerField';

import type { BoundValue } from '../../core/binding';

import type { CalendarRange } from '../calendar/Calendar';
import type { DateFieldInputProps, StrictRangeDatePickerProps } from '../date-picker/datePickerField';


/* --------
 * Types Definition
 * -------- */

export type {
  CalendarLabels,
  DateFieldLabels,
  DateRange,
  DateValidity,
  DayMeta,
  RangeDatePickerLabels,
  StrictRangeDatePickerProps
} from '../date-picker/datePickerField';

export type RangeDatePickerProps = StrictRangeDatePickerProps & DateFieldInputProps;


/* --------
 * Constants Definition
 * -------- */

const EMPTY_RANGE: CalendarRange = { from: null, to: null };


/* --------
 * Component Definition
 * -------- */

/**
 * A period in one field, "09/11/2026 – 22/11/2026", typed one date after the other without stopping or
 * picked on one calendar. The single date is `DatePicker`, with which it shares everything else.
 *
 * ```tsx
 * <Field label={'Period'} error={periodErrorMessage}>
 *   <RangeDatePicker
 *     value={period} onValueChange={setPeriod} locale={'it'} labels={rangeLabels} onValidityChange={setPeriodError}
 *   />
 * </Field>
 * ```
 *
 * The value is `{ from, to }`, each a `"2026-11-16"` string or `null`. The calendar picks the start with
 * the first click and the end with the second, with a preview under the pointer; closing after one click
 * gives back the period there was. The end before the start is reported (`order`), never swapped. A
 * period with one end only, written "09/11/2026" or "– 22/11/2026", is reported as `open` unless
 * `allowOpenRange`. `onValidityChange` says which end the report is about.
 *
 * Needs `dayjs`, an optional peer of this package, with the locale loaded by the application.
 *
 * Slots: those of `DatePicker`, the root with `data-mode="range"`, and no `date-picker-today`.
 */
const RangeDatePickerBase = React.forwardRef<HTMLInputElement, RangeDatePickerProps>((props, ref) => (
  <DatePickerField {...props} ref={ref} mode={'range'} />
));

RangeDatePickerBase.displayName = 'RangeDatePicker';

/** Bound to a form through `binding`: see `bindable` in core */
export const RangeDatePicker = bindable(RangeDatePickerBase, {
  kind: 'date',
  bind: (field: BoundValue<CalendarRange>) => ({
    name         : field.name,
    ref          : field.ref,
    value        : field.value ?? EMPTY_RANGE,
    onValueChange: field.onChange,
    onBlur       : field.onBlur
  })
});
