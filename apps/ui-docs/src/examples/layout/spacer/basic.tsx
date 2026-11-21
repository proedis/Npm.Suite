import * as React from 'react';

import { Download, Filter, Plus } from 'lucide-react';

import { Button, IconButton } from '@proedis/ui/actions/button';
import { Spacer, Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack direction={'horizontal'} align={'center'} gap={2} className={'w-full rounded-lg border border-border p-2'}>
      <IconButton label={'Filter'} icon={<Filter />} />
      <IconButton label={'Download'} icon={<Download />} />
      <Spacer />
      <Button size={'sm'} leading={<Plus />}>New order</Button>
    </Stack>
  );
}
