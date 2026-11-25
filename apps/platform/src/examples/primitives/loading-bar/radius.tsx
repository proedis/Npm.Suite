import * as React from 'react';

import { Stack } from '@proedis/ui/layout';
import { LoadingBar } from '@proedis/ui/primitives';

import type { LoadingBarRadius } from '@proedis/ui/primitives';


const RADII: readonly LoadingBarRadius[] = [ 'default', 'sm', 'md', 'full' ];


export default function Example(): React.ReactNode {
  return (
    <Stack gap={'lg'} className={'w-full max-w-md'}>
      {RADII.map((radius) => (
        <Stack key={radius} gap={'xs'}>
          <code className={'font-mono text-xs text-muted-foreground'}>lineWidth={'{8}'} radius={`'${radius}'`}</code>
          <LoadingBar lineWidth={8} radius={radius} />
        </Stack>
      ))}
    </Stack>
  );
}
