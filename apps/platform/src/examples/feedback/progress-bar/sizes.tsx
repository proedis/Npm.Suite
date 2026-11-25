import * as React from 'react';

import { ProgressBar } from '@proedis/ui/feedback/progress-bar';
import { Stack } from '@proedis/ui/layout';

import type { ProgressBarSize } from '@proedis/ui/feedback/progress-bar';


const SIZES: readonly ProgressBarSize[] = [ 'xs', 'sm', 'md', 'lg', 'xl' ];


export default function Example(): React.ReactNode {
  return (
    <Stack gap={'md'} className={'w-full max-w-md'}>
      {SIZES.map((size, index) => (
        <ProgressBar key={size} size={size} label={`size="${size}"`} value={20 + (index * 18)} />
      ))}
    </Stack>
  );
}
