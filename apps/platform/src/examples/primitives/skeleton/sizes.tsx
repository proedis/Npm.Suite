import * as React from 'react';

import { Stack } from '@proedis/ui/layout';
import { Skeleton } from '@proedis/ui/primitives';


/** The skeleton beside the text it stands for: each line is as tall as a line of that size */
export default function Example(): React.ReactNode {
  return (
    <Stack columns={2} gap={'lg'} className={'w-full max-w-xl'}>
      <Stack gap={0}>
        <p className={'text-xl font-semibold'}>Vehicles in service</p>
        <p className={'text-sm text-muted-foreground'}>Fourteen of eighteen on the road, two at the depot, two in the workshop.</p>
      </Stack>
      <Stack gap={0}>
        <Skeleton size={'xl'} className={'w-3/5'} />
        <Skeleton size={'sm'} lines={2} />
      </Stack>
    </Stack>
  );
}
