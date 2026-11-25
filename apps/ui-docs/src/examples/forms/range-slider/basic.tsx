import * as React from 'react';

import { RangeSlider } from '@proedis/ui/forms/range-slider';
import { Stack } from '@proedis/ui/layout';

import type { SliderRange } from '@proedis/ui/forms/range-slider';


const LABELS = { start: 'Minimum load', end: 'Maximum load' } as const;


export default function Example(): React.ReactNode {
  const [ load, setLoad ] = React.useState<SliderRange>([ 4, 12 ]);

  return (
    <Stack gap={'lg'} className={'w-full max-w-sm'}>
      <RangeSlider
        label={'Load'}
        min={0}
        max={20}
        format={{ style: 'unit', unit: 'kilogram' }}
        value={load}
        onValueChange={setLoad}
        labels={LABELS}
      />
      <RangeSlider variant={'field'} label={'Load'} min={0} max={20} value={load} onValueChange={setLoad} labels={LABELS} />
      <p className={'text-sm text-muted-foreground'}>
        Value: <code className={'font-mono text-foreground'}>{JSON.stringify(load)}</code>
      </p>
    </Stack>
  );
}
