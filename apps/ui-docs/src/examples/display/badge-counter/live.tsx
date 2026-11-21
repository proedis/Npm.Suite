import * as React from 'react';

import { Bell } from 'lucide-react';

import { Button, IconButton } from '@proedis/ui/actions/button';
import { BadgeCounter } from '@proedis/ui/display/badge-counter';
import { Cluster, Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  const [ count, setCount ] = React.useState(0);

  const handleAdd = React.useCallback(() => setCount((value) => value + 1), []);
  const handleClear = React.useCallback(() => setCount(0), []);

  return (
    <Cluster gap={6}>
      <Stack as={'span'} inline className={'relative'}>
        <IconButton label={'Jobs'} icon={<Bell />} aria-describedby={'live-count'} />
        {/* At 0 it renders nothing at all */}
        <BadgeCounter count={count} tone={'info'} />
        <span id={'live-count'} hidden>{count ? `${count} to look at` : 'Nothing to look at'}</span>
      </Stack>
      <Cluster gap={2}>
        <Button size={'sm'} fill={'soft'} onClick={handleAdd}>A job arrives</Button>
        <Button size={'sm'} fill={'plain'} tone={'muted'} onClick={handleClear}>Read them all</Button>
      </Cluster>
    </Cluster>
  );
}
