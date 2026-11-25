import * as React from 'react';

import { Info } from 'lucide-react';

import { IconButton } from '@proedis/ui/actions/button';
import { Stack } from '@proedis/ui/layout';
import { Popover } from '@proedis/ui/overlays/popover';


export default function Example(): React.ReactNode {
  return (
    <Stack direction={'horizontal'} align={'center'} gap={1}>
      <span className={'text-sm font-medium'}>Fill level</span>

      {/* No title: aria-label names it, and the description is the whole content */}
      <Popover
        aria-label={'About the fill level'}
        trigger={<IconButton size={'sm'} label={'About the fill level'} icon={<Info />} />}
        description={'Read by the sensor of the container at every emptying, and once a day in between. A value older than two days is shown in grey.'}
        labels={{ close: 'Close' }}
      />
    </Stack>
  );
}
