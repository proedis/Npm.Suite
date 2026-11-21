import * as React from 'react';

import { Recycle, Truck } from 'lucide-react';

import { Badge } from '@proedis/ui/display/badge';
import { Cluster } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Cluster gap={2}>
      {/* A status that needs no words next to its colour still has words: the dot adds, it does not replace */}
      <Badge tone={'success'} dot>In service</Badge>
      <Badge tone={'secondary'} dot>Off duty</Badge>
      <Badge tone={'info'}>
        <Truck />
        Compactor
      </Badge>
      <Badge tone={'primary'}>
        <Recycle />
        Recyclable
      </Badge>
      <Badge tone={'destructive'} fill={'solid'} size={'sm'}>12</Badge>
    </Cluster>
  );
}
