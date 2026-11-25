import * as React from 'react';

import { FiltersBar } from '@proedis/ui/data/filters-bar';

import { filtersBarLabels } from '../labels';

import { DISTRICT_OPTIONS, DRIVER_OPTIONS, SHIFT_OPTIONS, STATUS_OPTIONS } from './options';


export default function Example(): React.ReactNode {
  const [ shift, setShift ] = React.useState<string | null>(null);
  const [ status, setStatus ] = React.useState<string[]>([]);
  const [ driver, setDriver ] = React.useState<string[]>([ 'person-1', 'person-4', 'person-7', 'person-9' ]);
  const [ district, setDistrict ] = React.useState<string | null>(null);

  return (
    <FiltersBar
      filters={[
        /* One value: a tick on the right, and choosing closes the list */
        { id: 'shift', label: 'Shift', options: SHIFT_OPTIONS, value: shift, onValueChange: setShift },

        /* Several values: a box per value, Select all and Clear in the footer */
        { id: 'status', label: 'Status', multiple: true, options: STATUS_OPTIONS, value: status, onValueChange: setStatus },

        /* Past eight values the list gets a search of its own */
        { id: 'driver', label: 'Driver', multiple: true, options: DRIVER_OPTIONS, value: driver, onValueChange: setDriver },

        /* Off in this page, still reachable: the tooltip says why */
        {
          id            : 'district',
          label         : 'District',
          options       : DISTRICT_OPTIONS,
          value         : district,
          onValueChange : setDistrict,
          disabled      : true,
          disabledReason: 'This depot serves one district'
        },

        /* The values are on their way: a spinner in place of the arrow */
        { id: 'vehicle', label: 'Vehicle', options: [], value: null, onValueChange: () => undefined, loading: true }
      ]}
      onClear={() => {
        setShift(null);
        setStatus([]);
        setDriver([]);
      }}
      labels={filtersBarLabels}
      className={'w-full'}
    />
  );
}
