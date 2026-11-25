import * as React from 'react';

import { Stack } from '@proedis/ui/layout';
import { ScrollArea } from '@proedis/ui/primitives';


const STOPS = Array.from({ length: 24 }, (_, index) => `Stop ${index + 1}, Via Garibaldi ${index * 2 + 1}`);


export default function Example(): React.ReactNode {
  return (
    <ScrollArea maxHeight={240} className={'w-full max-w-sm rounded-xl border border-border'}>
      <Stack gap={0} as={'ol'} divided className={'text-sm'}>
        {STOPS.map((stop) => <li key={stop} className={'px-4 py-2.5'}>{stop}</li>)}
      </Stack>
    </ScrollArea>
  );
}
