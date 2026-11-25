import * as React from 'react';

import { ArrowRight, ChevronDown, Plus, Upload } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { Cluster } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Cluster gap={3}>
      <Button leading={<Plus />}>New project</Button>
      <Button fill={'soft'} trailing={<ChevronDown />}>Options</Button>
      <Button fill={'plain'} trailing={<ArrowRight />}>Continue</Button>
      <Button fill={'soft'} tone={'secondary'} leading={<Upload />} trailing={<ChevronDown />}>Import</Button>
    </Cluster>
  );
}
