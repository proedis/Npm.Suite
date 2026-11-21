import * as React from 'react';

import { inertValue, useDelayedBusy } from '@proedis/react';
import { Button } from '@proedis/ui/actions/button';
import { Cluster, Stack } from '@proedis/ui/layout';
import { BusyVeil } from '@proedis/ui/primitives';


export default function Example(): React.ReactNode {
  const [ busy, setBusy ] = React.useState(false);
  const wait = useDelayedBusy(busy);

  /** A request that lasts `ms`: under 300ms the veil never shows */
  const run = React.useCallback((ms: number) => {
    setBusy(true);
    window.setTimeout(() => setBusy(false), ms);
  }, []);

  const handleFast = React.useCallback(() => run(150), [ run ]);
  const handleSlow = React.useCallback(() => run(1500), [ run ]);

  return (
    <Stack gap={4} align={'center'} className={'w-full max-w-md'}>
      <Cluster gap={3}>
        <Button fill={'soft'} onClick={handleFast}>An answer in 150ms</Button>
        <Button fill={'soft'} onClick={handleSlow}>An answer in 1.5s</Button>
      </Cluster>
      <div className={'relative h-28 w-full rounded-xl border border-border bg-card'} aria-busy={wait.busy} inert={inertValue(wait.busy)}>
        <p className={'p-4 text-sm text-muted-foreground'}>
          {wait.busy ? 'Busy: clicks are blocked from the first millisecond.' : 'Idle.'}
        </p>
        <BusyVeil visible={wait.visible} label={'Working'} />
      </div>
    </Stack>
  );
}
