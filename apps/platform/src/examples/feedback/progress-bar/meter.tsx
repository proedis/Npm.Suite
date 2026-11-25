import * as React from 'react';

import { Meter } from '@proedis/ui/feedback/progress-bar';
import { Stack } from '@proedis/ui/layout';


const CAPACITY = 18000;

/** The tone is the caller's to pick from the value: a full vehicle is a warning, not a success */
function loadTone(load: number): 'success' | 'warning' | 'destructive' {
  if (load > CAPACITY * 0.95) {
    return 'destructive';
  }

  return load > CAPACITY * 0.8 ? 'warning' : 'success';
}


export default function Example(): React.ReactNode {
  return (
    <Stack gap={'lg'} className={'w-full max-w-md'}>
      {[ 6400, 15300, 17800 ].map((load) => (
        <Meter
          key={load}
          label={'Load of FT-234-KL'}
          value={load}
          max={CAPACITY}
          tone={loadTone(load)}
          track={'tone'}
          format={{ style: 'unit', unit: 'kilogram', maximumFractionDigits: 0 }}
          valuePosition={'end'}
          showBounds
        />
      ))}
    </Stack>
  );
}
