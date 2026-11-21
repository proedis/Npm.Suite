import * as React from 'react';

import { SegmentedControl } from '@proedis/ui/actions/segmented-control';
import { cn } from '@proedis/ui/core';
import { FiltersBar } from '@proedis/ui/data/filters-bar';
import { Stack } from '@proedis/ui/layout';

import type { DateFilter } from '@proedis/ui/data/filters-bar';
import { filtersBarLabels } from '../labels';

import { DISTRICT_OPTIONS, DRIVER_OPTIONS, MATERIAL_OPTIONS, SHIFT_OPTIONS, STATUS_OPTIONS } from './options';


type Width = 'wide' | 'medium' | 'narrow';

/** Three widths of the same bar: the filters that do not fit go into More filters, the last ones first */
const WIDTH_CLASS: Readonly<Record<Width, string>> = {
  wide  : 'w-full',
  medium: 'w-full max-w-md',
  narrow: 'w-full max-w-40'
};


export default function Example(): React.ReactNode {
  const [ width, setWidth ] = React.useState<Width>('medium');

  const [ status, setStatus ] = React.useState<string[]>([]);
  const [ district, setDistrict ] = React.useState<string | null>(null);
  const [ driver, setDriver ] = React.useState<string[]>([]);
  const [ shift, setShift ] = React.useState<string | null>('morning');
  const [ material, setMaterial ] = React.useState<string[]>([ 'glass' ]);
  const [ scheduled, setScheduled ] = React.useState<DateFilter['value']>({ from: null, to: null });

  const handleClear = React.useCallback(() => {
    setStatus([]);
    setDistrict(null);
    setDriver([]);
    setShift(null);
    setMaterial([]);
    setScheduled({ from: null, to: null });
  }, []);

  return (
    <Stack gap={4} className={'w-full'}>
      <SegmentedControl aria-label={'Width of the bar'} size={'sm'} value={width} onValueChange={(value) => setWidth(value as Width)}>
        <SegmentedControl.Item value={'wide'}>Wide</SegmentedControl.Item>
        <SegmentedControl.Item value={'medium'}>Medium</SegmentedControl.Item>
        <SegmentedControl.Item value={'narrow'}>Narrow</SegmentedControl.Item>
      </SegmentedControl>

      <div className={cn('rounded-lg border border-dashed border-border p-2', WIDTH_CLASS[width])}>
        <FiltersBar
          filters={[
            { id: 'status', label: 'Status', multiple: true, options: STATUS_OPTIONS, value: status, onValueChange: setStatus },
            { id: 'district', label: 'District', options: DISTRICT_OPTIONS, value: district, onValueChange: setDistrict },
            { id: 'driver', label: 'Driver', multiple: true, options: DRIVER_OPTIONS, value: driver, onValueChange: setDriver },
            { id: 'shift', label: 'Shift', options: SHIFT_OPTIONS, value: shift, onValueChange: setShift },
            { id: 'material', label: 'Material', multiple: true, options: MATERIAL_OPTIONS, value: material, onValueChange: setMaterial },
            { id: 'scheduled', label: 'Date', kind: 'date', value: scheduled, onValueChange: setScheduled }
          ]}
          onClear={handleClear}
          labels={filtersBarLabels}
        />
      </div>
    </Stack>
  );
}
