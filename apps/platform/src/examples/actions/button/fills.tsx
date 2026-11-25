import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { Cluster } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Cluster gap={3}>
      <Button fill={'solid'}>Publish</Button>
      <Button fill={'soft'}>Save as draft</Button>
      <Button fill={'plain'}>Discard</Button>
    </Cluster>
  );
}
