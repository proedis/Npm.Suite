import * as React from 'react';

import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { Tooltip } from '@proedis/ui/actions/tooltip';
import { Cluster } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Cluster gap={3}>
      <Tooltip content={'Above, the default'} side={'top'}>
        <Button fill={'soft'} tone={'secondary'} leading={<ArrowUp />}>Top</Button>
      </Tooltip>
      <Tooltip content={'On the right'} side={'right'}>
        <Button fill={'soft'} tone={'secondary'} leading={<ArrowRight />}>Right</Button>
      </Tooltip>
      <Tooltip content={'Below'} side={'bottom'}>
        <Button fill={'soft'} tone={'secondary'} leading={<ArrowDown />}>Bottom</Button>
      </Tooltip>
      <Tooltip content={'On the left'} side={'left'}>
        <Button fill={'soft'} tone={'secondary'} leading={<ArrowLeft />}>Left</Button>
      </Tooltip>
    </Cluster>
  );
}
