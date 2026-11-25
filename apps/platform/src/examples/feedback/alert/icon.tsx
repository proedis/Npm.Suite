import * as React from 'react';

import { CalendarClock, Truck } from 'lucide-react';

import { Alert } from '@proedis/ui/feedback/alert';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={'sm'} className={'w-full max-w-xl'}>
      {/* An icon of yours, in the box of the tone or on its fill */}
      <Alert tone={'info'} icon={<CalendarClock />} title={'New collection calendar'}>
        The winter calendar starts on Monday 4 November.
      </Alert>
      <Alert variant={'soft'} tone={'warning'} toneLabel={'Warning'} icon={<Truck />} title={'Vehicle in the workshop'}>
        FT-234-KL is back on Thursday: round 14 runs with the reserve.
      </Alert>

      {/* No icon: the text starts at the edge */}
      <Alert variant={'soft'} tone={'success'} icon={false}>Contract renewed until 31 December 2026.</Alert>
    </Stack>
  );
}
