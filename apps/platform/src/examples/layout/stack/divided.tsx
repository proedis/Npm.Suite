import * as React from 'react';

import { Stack } from '@proedis/ui/layout';


const VEHICLES = [
  { plate: 'FT-234-KL', state: 'On a round' },
  { plate: 'GA-118-PB', state: 'At the depot' },
  { plate: 'EZ-907-TM', state: 'In the workshop' }
];

const FIGURES = [
  { label: 'Stops', value: '38' },
  { label: 'Done', value: '24' },
  { label: 'Left', value: '14' }
];


export default function Example(): React.ReactNode {
  return (
    <Stack gap={8} className={'w-full max-w-md'}>
      <Stack gap={0} divided className={'rounded-lg border border-border'}>
        {VEHICLES.map((vehicle) => (
          <Stack gap={0} key={vehicle.plate} direction={'horizontal'} justify={'between'} className={'px-4 py-3 text-sm'}>
            <span className={'font-mono font-medium text-foreground'}>{vehicle.plate}</span>
            <span className={'text-muted-foreground'}>{vehicle.state}</span>
          </Stack>
        ))}
      </Stack>

      <Stack gap={0} direction={'horizontal'} divided className={'rounded-lg border border-border'}>
        {FIGURES.map((figure) => (
          <Stack key={figure.label} gap={0.5} align={'center'} className={'flex-1 py-3'}>
            <span className={'text-xl font-semibold text-foreground'}>{figure.value}</span>
            <span className={'text-xs text-muted-foreground'}>{figure.label}</span>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
