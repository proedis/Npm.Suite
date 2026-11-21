import * as React from 'react';

import { CircleCheck } from 'lucide-react';

import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <p className={'max-w-md text-sm/7 text-muted-foreground'}>
      The round of Monday is{' '}
      <Stack as={'span'} inline direction={'horizontal'} align={'baseline'} gap={'xs'} className={'font-medium text-success'}>
        <CircleCheck aria-hidden className={'size-4 self-center'} />
        complete
      </Stack>
      , with every stop collected before noon.
    </p>
  );
}
