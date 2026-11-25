import * as React from 'react';

import { Slider } from '@proedis/ui/forms/slider';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  const [ grain, setGrain ] = React.useState(1);

  return (
    <Stack className={'w-full max-w-sm'}>
      <Slider
        label={'Grain'}
        min={0}
        max={2}
        step={0.05}
        format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
        value={grain}
        onValueChange={setGrain}
      />
    </Stack>
  );
}
