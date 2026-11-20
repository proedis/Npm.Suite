import * as React from 'react';

import { Download, Filter, RefreshCw, Settings, Trash2 } from 'lucide-react';

import { IconButton } from '@proedis/ui/actions/button';
import { Stack } from '@proedis/ui/layout';
import { Divider } from '@proedis/ui/primitives';


export default function Example(): React.ReactNode {
  return (
    <Stack direction={'horizontal'} align={'center'} gap={1}>
      <IconButton label={'Refresh'} icon={<RefreshCw />} />
      <IconButton label={'Filter'} icon={<Filter />} />
      <IconButton label={'Download'} icon={<Download />} />
      <IconButton label={'Settings'} icon={<Settings />} />
      <Divider orientation={'vertical'} className={'mx-1 h-5'} />
      <IconButton label={'Delete'} icon={<Trash2 />} tone={'destructive'} />
    </Stack>
  );
}
