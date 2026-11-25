import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { Alert } from '@proedis/ui/feedback/alert';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={3} className={'w-full max-w-xl'}>
      <Alert
        tone={'warning'}
        toneLabel={'Warning'}
        title={'Container with no contract'}
        action={<Button size={'sm'} fill={'solid'} tone={'secondary'}>Assign</Button>}
      >
        It is not emptied until it is assigned to a customer.
      </Alert>

      {/* In a narrow box the action goes under the text */}
      <Alert
        tone={'info'}
        title={'Signal closed'}
        action={<Button size={'sm'} fill={'solid'} tone={'secondary'}>Reopen</Button>}
        className={'max-w-sm'}
      >
        Closed by the dispatcher on Monday at 08:12.
      </Alert>
    </Stack>
  );
}
