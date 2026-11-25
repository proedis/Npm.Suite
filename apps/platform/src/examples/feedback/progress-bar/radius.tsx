import * as React from 'react';

import { ProgressBar } from '@proedis/ui/feedback/progress-bar';
import { Stack } from '@proedis/ui/layout';

import type { ProgressBarRadius } from '@proedis/ui/feedback/progress-bar';


const RADII: readonly ProgressBarRadius[] = [ 'default', 'md', 'sm', 'none' ];


export default function Example(): React.ReactNode {
  return (
    <Stack gap={'md'} className={'w-full max-w-md'}>
      {RADII.map((radius) => (
        <ProgressBar key={radius} size={'lg'} radius={radius} label={`radius="${radius}"`} value={58} />
      ))}
    </Stack>
  );
}
