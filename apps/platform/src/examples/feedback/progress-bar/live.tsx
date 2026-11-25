import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { ProgressBar } from '@proedis/ui/feedback/progress-bar';
import { Cluster, Stack } from '@proedis/ui/layout';


/** A change of value slides; with reduced motion it jumps. null runs a segment across */
export default function Example(): React.ReactNode {
  const [ value, setValue ] = React.useState<number | null>(30);

  return (
    <Stack gap={'md'} className={'w-full max-w-md'}>
      <ProgressBar
        label={'Import of the stops'}
        value={value}
        valuePosition={'floating'}
        indeterminateLabel={'Waiting for the server'}
      />
      <Cluster gap={'sm'}>
        <Button size={'sm'} fill={'soft'} onClick={() => setValue((current) => Math.max(0, (current ?? 0) - 15))}>Less</Button>
        <Button size={'sm'} fill={'soft'} onClick={() => setValue((current) => Math.min(100, (current ?? 0) + 15))}>More</Button>
        <Button size={'sm'} fill={'plain'} tone={'muted'} onClick={() => setValue(null)}>Indeterminate</Button>
      </Cluster>
    </Stack>
  );
}
