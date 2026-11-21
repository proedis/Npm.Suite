import * as React from 'react';

import { Pin, RefreshCw } from 'lucide-react';

import { Toggle } from '@proedis/ui/actions/toggle';
import { Cluster } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Cluster gap={3}>
      <Toggle defaultPressed leading={<Pin />}>Pinned stops</Toggle>

      {/* Icon only: the aria-label is the name and the text of the tooltip */}
      <Toggle aria-label={'Auto refresh'} leading={<RefreshCw />} defaultPressed />
    </Cluster>
  );
}
