import * as React from 'react';

import { ProgressBar } from '@proedis/ui/feedback/progress-bar';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={'lg'} className={'w-full max-w-md'}>
      <ProgressBar label={'top: over the bar, at the end of the label'} value={42} />
      <ProgressBar label={'end: after the bar'} value={42} valuePosition={'end'} />
      <ProgressBar label={'inside: from lg, its ink follows the fill'} value={42} size={'xl'} valuePosition={'inside'} />
      <ProgressBar label={'floating: a bubble at the end of the fill'} value={42} valuePosition={'floating'} />
      <ProgressBar label={'none: the label alone'} value={42} valuePosition={'none'} />
    </Stack>
  );
}
