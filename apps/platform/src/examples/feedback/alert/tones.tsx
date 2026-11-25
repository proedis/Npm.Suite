import * as React from 'react';

import { Alert } from '@proedis/ui/feedback/alert';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={3} className={'w-full max-w-xl'}>
      <Alert tone={'info'} title={'New collection calendar'}>
        The winter calendar starts on Monday 4 November.
      </Alert>
      <Alert tone={'success'} title={'Contract renewed'}>
        Valid until 31 December 2026, same frequency and containers.
      </Alert>
      <Alert tone={'warning'} toneLabel={'Warning'} title={'Container with no contract'}>
        It is not emptied until it is assigned to a customer.
      </Alert>
      <Alert tone={'destructive'} toneLabel={'Error'} title={'Route cannot start'}>
        The vehicle FT-234-KL is in the workshop until Thursday.
      </Alert>
    </Stack>
  );
}
