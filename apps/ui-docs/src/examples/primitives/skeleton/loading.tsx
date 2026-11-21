import * as React from 'react';

import { useDelayedBusy } from '@proedis/react';
import { Button } from '@proedis/ui/actions/button';
import { Badge } from '@proedis/ui/display/badge';
import { Item } from '@proedis/ui/display/item';
import { Stack } from '@proedis/ui/layout';
import { Skeleton } from '@proedis/ui/primitives';


const ROWS = [ 'Paper and cardboard', 'Glass', 'Organic waste' ];


export default function Example(): React.ReactNode {
  const [ loading, setLoading ] = React.useState(false);
  const wait = useDelayedBusy(loading);

  const handleReload = React.useCallback(() => {
    setLoading(true);
    window.setTimeout(() => setLoading(false), 1500);
  }, []);

  return (
    <Stack gap={3} align={'start'} className={'w-full max-w-sm'}>
      <Button fill={'soft'} size={'sm'} onClick={handleReload}>Load again</Button>
      <Stack divided aria-busy={wait.busy} className={'w-full rounded-xl border border-border text-sm'}>
        {ROWS.map((row) => (
          <Item key={row} inset>
            {wait.visible ? <Skeleton className={'w-40'} /> : <span className={'grow'}>{row}</span>}
            {wait.visible ? <Skeleton shape={'pill'} /> : <Badge tone={'success'}>Collected</Badge>}
          </Item>
        ))}
      </Stack>
    </Stack>
  );
}
