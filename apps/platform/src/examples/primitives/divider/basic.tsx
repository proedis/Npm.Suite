import * as React from 'react';

import { Stack } from '@proedis/ui/layout';
import { Divider } from '@proedis/ui/primitives';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={4} className={'w-full max-w-md text-sm'}>
      <p className={'text-foreground'}>The collection is planned for Monday morning.</p>
      <Divider />
      <p className={'text-muted-foreground'}>The skips are emptied in the order of the round.</p>
    </Stack>
  );
}
