import * as React from 'react';

import { FiltersBar } from '@proedis/ui/data/filters-bar';

import type { DateFilter } from '@proedis/ui/data/filters-bar';
import { filtersBarLabels } from '../labels';


/** The holidays of the period: muted, with their name on hover */
const HOLIDAYS: Readonly<Record<string, string>> = {
  '2026-11-01': 'All Saints',
  '2026-12-08': 'Immaculate Conception',
  '2026-12-25': 'Christmas',
  '2026-12-26': 'Saint Stephen'
};


export default function Example(): React.ReactNode {
  const [ scheduled, setScheduled ] = React.useState<DateFilter['value']>({ from: '2026-11-09', to: '2026-11-20' });
  const [ weighed, setWeighed ] = React.useState<DateFilter['value']>({ from: null, to: null });

  return (
    <FiltersBar
      filters={[
        {
          id           : 'scheduled',
          label        : 'Date',
          kind         : 'date',
          value        : scheduled,
          onValueChange: setScheduled,
          dayMeta      : (day) => (HOLIDAYS[day] ? { muted: true, hint: HOLIDAYS[day] } : undefined)
        },
        {
          id               : 'weighed',
          label            : 'Weighed',
          kind             : 'date',
          value            : weighed,
          onValueChange    : setWeighed,
          min              : '2026-01-01',
          max              : '2026-11-16',

          /* The weighbridge is closed on Sundays: no weighing to find */
          isDateUnavailable: (day) => new Date(`${day}T00:00:00Z`).getUTCDay() === 0
        }
      ]}
      onClear={() => {
        setScheduled({ from: null, to: null });
        setWeighed({ from: null, to: null });
      }}
      labels={filtersBarLabels}
      className={'w-full'}
    />
  );
}
