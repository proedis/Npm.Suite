import * as React from 'react';

import { Cluster, Stack } from '@proedis/ui/layout';
import { Spinner } from '@proedis/ui/primitives';


/** No tone of its own: it takes the ink of where it sits */
export default function Example(): React.ReactNode {
  return (
    <Cluster gap={8}>
      <Stack direction={'horizontal'} align={'center'} gap={2} className={'text-sm text-primary'}>
        <Spinner size={'sm'} /> Syncing
      </Stack>
      <Stack direction={'horizontal'} align={'center'} gap={2} className={'text-sm text-muted-foreground'}>
        <Spinner size={'sm'} /> Waiting for the GPS
      </Stack>
      <Stack direction={'horizontal'} align={'center'} gap={2} className={'text-sm text-destructive'}>
        <Spinner size={'sm'} /> Retrying
      </Stack>
    </Cluster>
  );
}
