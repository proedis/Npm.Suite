import * as React from 'react';

import { DatePicker } from '@proedis/ui/forms/date-picker';
import { Field } from '@proedis/ui/forms/field';

import type { DayMeta } from '@proedis/ui/forms/date-picker';
import labels from './labels';


/** The public holidays of the season, as month-day: muted in the grid, named on hover */
const HOLIDAYS: Readonly<Record<string, string>> = {
  '12-08': 'Immaculate Conception',
  '12-25': 'Christmas Day',
  '12-26': 'Saint Stephen',
  '01-01': 'New Year’s Day',
  '01-06': 'Epiphany'
};

/** No collection on Sundays: the day cannot be chosen */
function isSunday(day: string): boolean {
  return new Date(`${day}T12:00:00`).getDay() === 0;
}

function holiday(day: string): DayMeta | undefined {
  const name = HOLIDAYS[day.slice(5)];

  return name ? { muted: true, hint: name } : undefined;
}


export default function Example(): React.ReactNode {
  return (
    <Field
      className={'w-full max-w-xs'}
      label={'Extra collection'}
      description={'December and January only, never on a Sunday. Holidays are greyed and named.'}
    >
      <DatePicker
        locale={'en-GB'}
        defaultValue={'2026-12-09'}
        min={'2026-12-01'}
        max={'2027-01-31'}
        isDateUnavailable={isSunday}
        dayMeta={holiday}
        labels={labels}
      />
    </Field>
  );
}
