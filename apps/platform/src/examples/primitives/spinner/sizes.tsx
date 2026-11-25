import * as React from 'react';

import { Cluster } from '@proedis/ui/layout';
import { Spinner } from '@proedis/ui/primitives';


export default function Example(): React.ReactNode {
  return (
    <Cluster gap={6}>
      <Spinner size={'xs'} />
      <Spinner size={'sm'} />
      <Spinner size={'md'} />
      <Spinner size={'lg'} />
    </Cluster>
  );
}
