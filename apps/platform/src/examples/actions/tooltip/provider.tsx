import * as React from 'react';

import { Copy, Download, Pencil, Share2, Trash2 } from 'lucide-react';

import { IconButton } from '@proedis/ui/actions/button';
import { TooltipProvider } from '@proedis/ui/actions/tooltip';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    /* Once one has opened, its neighbours open at once: run the pointer along the row */
    <TooltipProvider delay={400} timeout={600}>
      <Stack direction={'horizontal'} gap={1}>
        <IconButton label={'Edit'} icon={<Pencil />} />
        <IconButton label={'Duplicate'} icon={<Copy />} />
        <IconButton label={'Share'} icon={<Share2 />} />
        <IconButton label={'Download'} icon={<Download />} />
        <IconButton label={'Delete'} icon={<Trash2 />} tone={'destructive'} />
      </Stack>
    </TooltipProvider>
  );
}
