'use client';

import * as React from 'react';

import { bindable } from '../../core/binding';

import { DatePickerField } from './datePickerField';

import type { BoundValue } from '../../core/binding';

import type { DateFieldInputProps, StrictDatePickerProps } from './datePickerField';


/* --------
 * Types Definition
 * -------- */

export type {
  CalendarLabels,
  DateFieldLabels,
  DatePickerLabels,
  DateRange,
  DateValidity,
  DayMeta,
  StrictDatePickerProps
} from './datePickerField';

export type DatePickerProps = StrictDatePickerProps & DateFieldInputProps;


/* --------
 * Component Definition
 * -------- */

/**
 * The date field: typed (the separators arrive on their own) or picked from the calendar that the
 * button at its end opens. A period is `RangeDatePicker`.
 *
 * ```tsx
 * <Field span={2} required label={'Opening date'} error={dateErrorMessage}>
 *   <DatePicker value={date} onValueChange={setDate} locale={'it'} labels={dateLabels} onValidityChange={setDateError} />
 * </Field>
 * ```
 *
 * The value is a string, `"2026-11-16"`, never a `Date`. The order of the parts is the language's:
 * day, month, year in Italian. Errors are told on leaving the field, never while typing, through
 * `onValidityChange`: a half date leaves the value `null`, an impossible one too, a date out of the
 * limits is kept and reported. An empty field is not an error. The calendar button and the x are not
 * Tab stops: a click in the text opens the calendar and leaves the focus there to type, Alt ↓ opens it
 * with the focus in the grid, Ctrl (⌘) Backspace empties.
 *
 * Needs `dayjs`, an optional peer of this package, with the locale loaded by the application.
 *
 * Slots: `date-picker` (with `data-mode="date"`), `date-picker-field`, `date-picker-input`,
 * `date-picker-actions`, `date-picker-calendar-button`, `date-picker-clear`, `date-picker-panel`,
 * `date-picker-footer`, and the `calendar-*` slots of the grid (`calendar-previous`, `calendar-next`,
 * `calendar-weekdays`, `calendar-weekday`, `calendar-week`, `calendar-cell`, `calendar-day`,
 * `calendar-month`, `calendar-year`). The footer holds `date-picker-footer-text` and
 * `date-picker-footer-actions`, the row of `date-picker-today` and `date-picker-footer-clear`.
 */
const DatePickerBase = React.forwardRef<HTMLInputElement, DatePickerProps>((props, ref) => (
  <DatePickerField {...props} ref={ref} mode={'date'} />
));

DatePickerBase.displayName = 'DatePicker';

/** Bound to a form through `binding`: see `bindable` in core */
export const DatePicker = bindable(DatePickerBase, {
  kind: 'date',
  bind: (field: BoundValue<string | null>) => ({
    name         : field.name,
    ref          : field.ref,
    value        : field.value ?? null,
    onValueChange: field.onChange,
    onBlur       : field.onBlur
  })
});
