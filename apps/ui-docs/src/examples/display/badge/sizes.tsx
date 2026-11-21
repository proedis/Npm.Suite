import * as React from 'react';

import { Badge } from '@proedis/ui/display/badge';
import { Cluster } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Cluster gap={3}>
      <Badge size={'sm'} tone={'primary'} dot>Small</Badge>
      <Badge size={'md'} tone={'primary'} dot>Medium</Badge>
      <Badge size={'lg'} tone={'primary'} dot>Large</Badge>
    </Cluster>
  );
}
