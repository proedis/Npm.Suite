import * as React from 'react';

import { ProgressBar } from '@proedis/ui/feedback/progress-bar';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={'lg'} className={'w-full max-w-md'}>
      <ProgressBar label={'Stops covered'} value={29} max={38} />
      <ProgressBar
        label={'Round 14'}
        value={29}
        max={38}
        tone={'success'}
        valueText={(_, value) => `${value} of 38 stops`}
      />
    </Stack>
  );
}
