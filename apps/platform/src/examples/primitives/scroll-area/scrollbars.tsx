import * as React from 'react';

import { Stack } from '@proedis/ui/layout';
import { ScrollArea } from '@proedis/ui/primitives';

import type { ScrollbarVisibility } from '@proedis/ui/primitives';


const STOPS = Array.from({ length: 16 }, (_, index) => `Stop ${index + 1}, Via Garibaldi ${index * 2 + 1}`);

const VISIBILITY: readonly ScrollbarVisibility[] = [ 'thin', 'hover', 'none' ];


export default function Example(): React.ReactNode {
  return (
    <Stack columns={{ base: 1, md: 3 }} className={'w-full'}>
      {VISIBILITY.map((scrollbar) => (
        <Stack key={scrollbar} gap={'xs'}>
          <code className={'font-mono text-xs text-muted-foreground'}>scrollbar={`'${scrollbar}'`}</code>
          <ScrollArea maxHeight={180} scrollbar={scrollbar} stableGutter className={'rounded-xl border border-border'}>
            <Stack gap={0} as={'ol'} divided className={'text-sm'}>
              {STOPS.map((stop) => <li key={stop} className={'px-4 py-2.5'}>{stop}</li>)}
            </Stack>
          </ScrollArea>
        </Stack>
      ))}
    </Stack>
  );
}
