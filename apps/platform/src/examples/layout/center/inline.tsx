import * as React from 'react';

import { Center } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <p className={'text-sm text-muted-foreground'}>
      Waiting for{' '}
      <Center as={'span'} inline className={'size-6 rounded-full bg-primary text-xs font-semibold text-primary-foreground align-middle'}>
        3
      </Center>
      {' '}drivers to confirm.
    </p>
  );
}
