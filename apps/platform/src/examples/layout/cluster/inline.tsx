import * as React from 'react';

import { Badge } from '@proedis/ui/display/badge';
import { Cluster } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <p className={'max-w-md text-sm/7 text-muted-foreground'}>
      This round collects{' '}
      <Cluster as={'span'} inline gap={1} className={'align-middle'}>
        <Badge size={'sm'} fill={'soft'} tone={'info'}>Paper</Badge>
        <Badge size={'sm'} fill={'soft'} tone={'success'}>Glass</Badge>
      </Cluster>
      {' '}on Tuesdays and Fridays.
    </p>
  );
}
