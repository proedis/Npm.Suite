import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { Badge } from '@proedis/ui/display/badge';
import { Surface } from '@proedis/ui/display/surface';
import { Cluster, Stack } from '@proedis/ui/layout';

import { DomReadout } from '@/examples/foundations/DomReadout';


export default function Example(): React.ReactNode {
  const ref = React.useRef<HTMLDivElement>(null);

  return (
    <Stack gap={4} className={'w-full max-w-lg'}>
      <Cluster ref={ref} gap={3}>
        {/* No props: the attributes say what the defaults resolved to */}
        <Badge>Draft</Badge>
        <Badge fill={'solid'} tone={'success'} dot>Completed</Badge>
        <Button size={'sm'} loading loadingLabel={'Saving'}>Save</Button>
        <Surface className={'border border-border px-4 py-2 text-sm'}>A surface</Surface>
        <Surface elevation={'soft'} className={'border border-border px-4 py-2 text-sm'}>Soft, asked for</Surface>
      </Cluster>

      <DomReadout of={ref} selector={'[data-slot=badge], [data-slot=button], [data-slot=surface]'} />
    </Stack>
  );
}
