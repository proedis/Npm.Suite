import * as React from 'react';

import { Tooltip } from '@proedis/ui/actions/tooltip';
import { Badge } from '@proedis/ui/display/badge';
import { Cluster } from '@proedis/ui/layout';


const HIDDEN = [ 'Glass', 'Organic', 'Metal' ];


export default function Example(): React.ReactNode {
  return (
    <Cluster gap={1.5}>
      <Badge fill={'soft'} tone={'secondary'}>Paper</Badge>
      <Badge fill={'soft'} tone={'secondary'}>Plastic</Badge>

      {/* A list of values, one per line */}
      <Tooltip content={HIDDEN.map((name) => <div key={name}>{name}</div>)}>
        <Badge fill={'soft'} tone={'muted'}>{`+${HIDDEN.length}`}</Badge>
      </Tooltip>
    </Cluster>
  );
}
