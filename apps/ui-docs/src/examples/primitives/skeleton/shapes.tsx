import * as React from 'react';

import { Stack } from '@proedis/ui/layout';
import { Skeleton } from '@proedis/ui/primitives';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={'lg'} className={'w-full max-w-sm'}>
      <Skeleton />
      <Skeleton lines={3} className={'w-2/3'} />
      <Skeleton shape={'block'} className={'h-24'} />
      <Skeleton shape={'pill'} />
      <Skeleton shape={'field'} />
      <Skeleton shape={'item'} />
    </Stack>
  );
}
