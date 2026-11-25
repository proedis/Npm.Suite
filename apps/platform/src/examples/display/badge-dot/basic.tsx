import * as React from 'react';

import { BadgeDot } from '@proedis/ui/display/badge-dot';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={'sm'} className={'text-sm'}>
      {/* Next to a text that says it: decoration, hidden from assistive technology */}
      <Stack direction={'horizontal'} align={'center'} gap={'xs'}>
        <BadgeDot tone={'success'} />
        Round 14 is running
      </Stack>
      <Stack direction={'horizontal'} align={'center'} gap={'xs'}>
        <BadgeDot tone={'destructive'} />
        Vehicle FT-234-KL is stopped
      </Stack>

      {/* Alone: it says what it means */}
      <Stack direction={'horizontal'} align={'center'} gap={'xs'}>
        Synchronisation
        <BadgeDot tone={'info'} pulse label={'Running'} />
      </Stack>
    </Stack>
  );
}
