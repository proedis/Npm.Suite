import * as React from 'react';

import { Heading } from '@proedis/ui/display/heading';
import { Stack } from '@proedis/ui/layout';
import { Divider, ScrollArea } from '@proedis/ui/primitives';


const EVENTS = Array.from({ length: 30 }, (_, index) => `08:${String(index * 2).padStart(2, '0')}  Skip ${1200 + index} emptied`);


/** A panel of fixed height: the header stays, the list takes the rest and scrolls */
export default function Example(): React.ReactNode {
  return (
    <Stack className={'h-72 w-full max-w-sm overflow-hidden rounded-xl border border-border'}>
      <Heading className={'px-4 py-3'}>
        <Heading.Title>Today’s events</Heading.Title>
        <Heading.Description>FT-234-KL</Heading.Description>
      </Heading>
      <Divider />
      {/* No maxHeight: the flex parent sizes it, and min-h-0 is what lets it shrink */}
      <ScrollArea className={'flex-1'}>
        <Stack as={'ul'} className={'px-4 py-2 font-mono text-xs text-muted-foreground'}>
          {EVENTS.map((event) => <li key={event} className={'py-1'}>{event}</li>)}
        </Stack>
      </ScrollArea>
    </Stack>
  );
}
