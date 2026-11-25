import * as React from 'react';

import { Badge } from '@proedis/ui/display/badge';
import { Cluster } from '@proedis/ui/layout';


const MATERIALS = [ 'Paper', 'Glass', 'Plastic', 'Organic', 'Metal', 'Textiles', 'Bulky waste', 'Electronics', 'Batteries' ];


export default function Example(): React.ReactNode {
  return (
    <Cluster className={'max-w-md'}>
      {MATERIALS.map((material) => (
        <Badge key={material} fill={'soft'} tone={'secondary'}>{material}</Badge>
      ))}
    </Cluster>
  );
}
