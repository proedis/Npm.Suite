import * as React from 'react';

import { ProgressBar } from '@proedis/ui/feedback/progress-bar';
import { Stack } from '@proedis/ui/layout';


/** Every part of the bar in one place, for the slots: hover a row of the table below */
export default function Example(): React.ReactNode {
  return (
    <Stack gap={'lg'} className={'w-full max-w-md'}>
      <ProgressBar label={'Label, value on top, bounds'} value={46} showBounds />
      <ProgressBar label={'A value after the bar'} value={46} valuePosition={'end'} />
      <ProgressBar label={'A value inside'} value={46} size={'xl'} valuePosition={'inside'} />
      <ProgressBar label={'A bubble'} value={46} valuePosition={'floating'} />
    </Stack>
  );
}
