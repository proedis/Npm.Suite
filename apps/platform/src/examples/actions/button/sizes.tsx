import * as React from 'react';

import { Download } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { Cluster } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Cluster gap={3}>
      <Button size={'sm'} leading={<Download />}>Small</Button>
      <Button size={'md'} leading={<Download />}>Medium</Button>
      <Button size={'lg'} leading={<Download />}>Large</Button>
    </Cluster>
  );
}
