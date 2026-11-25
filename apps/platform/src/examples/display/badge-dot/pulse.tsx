import * as React from 'react';

import { BadgeDot } from '@proedis/ui/display/badge-dot';
import { Cluster } from '@proedis/ui/layout';


/** A state that is happening now: still under reduced motion */
export default function Example(): React.ReactNode {
  return (
    <Cluster gap={'lg'}>
      <BadgeDot tone={'success'} size={'sm'} pulse label={'Online'} />
      <BadgeDot tone={'destructive'} size={'md'} pulse label={'Recording'} />
      <BadgeDot tone={'info'} size={'lg'} pulse label={'Synchronising'} />
    </Cluster>
  );
}
