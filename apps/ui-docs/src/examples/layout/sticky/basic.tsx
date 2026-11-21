import * as React from 'react';

import { Stack, Sticky } from '@proedis/ui/layout';
import { ScrollArea } from '@proedis/ui/primitives';


const DAYS = [ 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday' ];


export default function Example(): React.ReactNode {
  return (
    <ScrollArea maxHeight={280} className={'w-full max-w-sm rounded-lg border border-border'}>
      {DAYS.map((day) => (
        <section key={day} aria-label={day}>
          {/* Each day pins to the top until the next one pushes it away */}
          <Sticky className={'border-b border-border bg-background/90 px-4 py-2 text-sm font-semibold text-foreground backdrop-blur'}>
            {day}
          </Sticky>
          <Stack divided>
            {[ 'Round 1', 'Round 2', 'Round 3' ].map((round) => (
              <p key={round} className={'px-4 py-3 text-sm text-muted-foreground'}>{day}, {round.toLowerCase()}</p>
            ))}
          </Stack>
        </section>
      ))}
    </ScrollArea>
  );
}
