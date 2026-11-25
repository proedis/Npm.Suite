import * as React from 'react';

import { Badge } from '@proedis/ui/display/badge';
import { Heading } from '@proedis/ui/display/heading';
import { Stack } from '@proedis/ui/layout';


/** Narrow the window: the title truncates and the badge keeps its size */
export default function Example(): React.ReactNode {
  return (
    <Heading className={'w-full max-w-xs'}>
      {/* A Stack, not a Cluster: a cluster wraps, and the badge would drop to a second line */}
      <Stack direction={'horizontal'} align={'center'} gap={2}>
        <Heading.Title lines={1}>Collection round 14, north district and industrial area</Heading.Title>
        <Badge tone={'warning'} dot>Late</Badge>
      </Stack>
      <Heading.Description>Last stop 12:04, FT-234-KL</Heading.Description>
    </Heading>
  );
}
