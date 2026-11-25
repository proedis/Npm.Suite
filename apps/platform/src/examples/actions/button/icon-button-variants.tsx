import * as React from 'react';

import { Pencil, Plus, Share2 } from 'lucide-react';

import { IconButton } from '@proedis/ui/actions/button';
import { Cluster, Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={5} align={'center'}>
      <Cluster gap={3}>
        <IconButton label={'Add'} icon={<Plus />} fill={'solid'} tone={'primary'} />
        <IconButton label={'Edit'} icon={<Pencil />} fill={'soft'} tone={'primary'} />
        <IconButton label={'Share'} icon={<Share2 />} fill={'plain'} tone={'primary'} />
      </Cluster>
      <Cluster gap={3}>
        <IconButton label={'Add'} icon={<Plus />} size={'sm'} fill={'soft'} />
        <IconButton label={'Add'} icon={<Plus />} size={'md'} fill={'soft'} />
        <IconButton label={'Add'} icon={<Plus />} size={'lg'} fill={'soft'} />
      </Cluster>
    </Stack>
  );
}
