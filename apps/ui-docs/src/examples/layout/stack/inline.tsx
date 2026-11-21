import * as React from 'react';

import { CircleCheck } from 'lucide-react';

import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <p className={'max-w-md text-sm/7 text-muted-foreground'}>
      The round of Monday is{' '}
      <Stack as={'span'} inline direction={'horizontal'} align={'center'} gap={1} className={'font-medium text-success'}>
        <CircleCheck aria-hidden className={'size-4'} />
        complete
      </Stack>
      , with every stop collected before noon.
    </p>
  );
}
