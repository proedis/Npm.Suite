import * as React from 'react';

import { Badge } from '@proedis/ui/display/badge';
import { Cluster } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Cluster gap={2}>
      <Badge>Draft</Badge>
      <Badge tone={'success'}>Collected</Badge>
      <Badge tone={'warning'} dot>Late</Badge>
      <Badge tone={'destructive'} fill={'solid'}>Missed</Badge>
    </Cluster>
  );
}
