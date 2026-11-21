import * as React from 'react';

import { Copy, Download, Pencil, Trash2 } from 'lucide-react';

import { IconButton } from '@proedis/ui/actions/button';
import { Stack } from '@proedis/ui/layout';
import { Divider } from '@proedis/ui/primitives';


export default function Example(): React.ReactNode {
  return (
    <Stack direction={'horizontal'} align={'center'} gap={1} className={'h-9'}>
      <IconButton label={'Edit'} icon={<Pencil />} />
      <IconButton label={'Duplicate'} icon={<Copy />} />
      <IconButton label={'Download'} icon={<Download />} />
      {/* self-stretch: as tall as the row, or as tall as a height you give it */}
      <Divider orientation={'vertical'} className={'mx-1 h-5 self-center'} />
      <IconButton label={'Delete'} icon={<Trash2 />} tone={'destructive'} />
    </Stack>
  );
}
