import * as React from 'react';

import { ProgressBar } from '@proedis/ui/feedback/progress-bar';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={'lg'} className={'w-full max-w-md'}>
      <ProgressBar label={'Upload'} value={64} showBounds />
      <ProgressBar
        label={'Weighed today'}
        value={1204}
        min={0}
        max={2000}
        format={{ style: 'unit', unit: 'kilogram' }}
        valuePosition={'end'}
        showBounds
      />
    </Stack>
  );
}
