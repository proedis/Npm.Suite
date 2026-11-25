import * as React from 'react';

import { Divider } from '@proedis/ui/primitives';


/** A divider in plain flow, not in a Stack: the room around it is its own */
export default function Example(): React.ReactNode {
  return (
    <div className={'w-full max-w-md text-sm text-muted-foreground'}>
      <p>Collection completed on route 12, 48 stops out of 48.</p>
      <Divider spacing={{ base: 'sm', md: 'lg' }} />
      <p>Two bins reported damaged, a report has been opened for each.</p>
      <Divider spacing={'xl'} lineStyle={'dashed'} label={'Tomorrow'} />
      <p>Route 14 starts at 6:30 from the Chieri depot.</p>
    </div>
  );
}
