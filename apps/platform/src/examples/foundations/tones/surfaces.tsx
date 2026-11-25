import * as React from 'react';

import { Badge } from '@proedis/ui/display/badge';
import { Cluster, Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={4}>
      <Cluster gap={2}>
        <Badge fill={'soft'} tone={'muted'}>Draft</Badge>
        <Badge fill={'soft'} tone={'secondary'}>Archived</Badge>
        <Badge fill={'soft'} tone={'primary'}>Planned</Badge>
      </Cluster>

      {/* What a tenth of a near-white looks like: the reason the two surface tones are an exception */}
      <Cluster gap={2}>
        <span className={'rounded-full bg-muted/10 px-2 py-0.5 text-xs font-medium text-muted-foreground'}>A tenth of muted</span>
        <span className={'rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-medium text-secondary-foreground'}>A tenth of secondary</span>
      </Cluster>
    </Stack>
  );
}
