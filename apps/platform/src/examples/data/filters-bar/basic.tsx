import * as React from 'react';

import { FiltersBar } from '@proedis/ui/data/filters-bar';
import { Stack } from '@proedis/ui/layout';

import type { DateRange } from '@proedis/ui/data/filters-bar';
import { filtersBarLabels } from '../labels';

import { DISTRICT_OPTIONS, STATUS_OPTIONS } from './options';


export default function Example(): React.ReactNode {

  /* The bar holds no value: the page does, usually in its address */
  const [ search, setSearch ] = React.useState('');
  const [ status, setStatus ] = React.useState<string[]>([ 'late' ]);
  const [ district, setDistrict ] = React.useState<string | null>(null);
  const [ scheduled, setScheduled ] = React.useState<DateRange>({ from: null, to: null });

  const handleClear = React.useCallback(() => {
    setStatus([]);
    setDistrict(null);
    setScheduled({ from: null, to: null });
  }, []);

  return (
    <Stack gap={4} className={'w-full'}>
      <FiltersBar
        search={{ value: search, onValueChange: setSearch, label: 'Search rounds', placeholder: 'E.g. RD-24017' }}
        filters={[
          { id: 'status', label: 'Status', multiple: true, options: STATUS_OPTIONS, value: status, onValueChange: setStatus },
          { id: 'district', label: 'District', options: DISTRICT_OPTIONS, value: district, onValueChange: setDistrict },
          { id: 'scheduled', label: 'Date', kind: 'date', value: scheduled, onValueChange: setScheduled }
        ]}
        onClear={handleClear}
        labels={filtersBarLabels}
      />

      <pre className={'overflow-x-auto rounded-md bg-muted px-3 py-2 font-mono text-xs text-muted-foreground'}>
        {JSON.stringify({ search, status, district, scheduled })}
      </pre>
    </Stack>
  );
}
