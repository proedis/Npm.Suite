import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { Stack, Sticky } from '@proedis/ui/layout';
import { ScrollArea } from '@proedis/ui/primitives';


export default function Example(): React.ReactNode {
  return (
    <ScrollArea maxHeight={280} className={'w-full max-w-sm rounded-lg border border-border'}>
      <Stack gap={3} className={'p-4'}>
        {Array.from({ length: 12 }, (_, index) => (
          <p key={index} className={'text-sm text-muted-foreground'}>Stop {index + 1}, Via Roma {index * 4 + 2}</p>
        ))}
      </Stack>
      {/* Pinned 2 steps above the bottom edge while the list scrolls under it */}
      <Sticky position={'bottom'} offset={2} className={'px-4'}>
        <Button block className={'shadow-md'}>Confirm 12 stops</Button>
      </Sticky>
    </ScrollArea>
  );
}
