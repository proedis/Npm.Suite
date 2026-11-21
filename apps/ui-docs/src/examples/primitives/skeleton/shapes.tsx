import * as React from 'react';

import { Stack } from '@proedis/ui/layout';
import { Skeleton } from '@proedis/ui/primitives';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={6} className={'w-full max-w-sm'}>
      <Skeleton />
      <Skeleton shape={'pill'} />
      <Skeleton shape={'field'} />
      <Skeleton lines={3} className={'w-2/3'} />
    </Stack>
  );
}
