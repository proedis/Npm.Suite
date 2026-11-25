import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { Cluster } from '@proedis/ui/layout';
import { Popover } from '@proedis/ui/overlays/popover';


export default function Example(): React.ReactNode {
  return (
    <Cluster gap={3}>
      <Popover
        aria-label={'Below, 280px'}
        trigger={<Button fill={'soft'} tone={'secondary'}>sm, below</Button>}
        description={'280px, for help and a choice. Below the control by default, above when there is no room.'}
        labels={{ close: 'Close' }}
      />
      <Popover
        aria-label={'Above, 320px'}
        side={'top'}
        width={'md'}
        trigger={<Button fill={'soft'} tone={'secondary'}>md, above</Button>}
        description={'320px, for a preview and text fields. Asked to open above, it still flips below when the top of the window is too close.'}
        labels={{ close: 'Close' }}
      />
    </Cluster>
  );
}
