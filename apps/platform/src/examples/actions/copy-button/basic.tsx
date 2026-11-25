import * as React from 'react';

import { CopyButton } from '@proedis/ui/actions/copy-button';
import { Cluster } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Cluster gap={'xs'} align={'center'}>
      <code className={'font-mono text-sm'}>SG-2038</code>
      <CopyButton value={'SG-2038'} labels={{ copy: 'Copy the code', copied: 'Copied' }} />
    </Cluster>
  );
}
