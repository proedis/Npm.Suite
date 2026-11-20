import * as React from 'react';

import { Archive, RefreshCw } from 'lucide-react';

import { IconButton } from '@proedis/ui/actions/button';
import { Cluster } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Cluster gap={3}>
      {/* Still focusable: the tooltip says what it is and, under it, why it is off */}
      <IconButton label={'Archive'} icon={<Archive />} disabled description={'Only a closed order can be archived'} />
      <IconButton label={'Refresh'} icon={<RefreshCw />} loading loadingLabel={'Refreshing'} />
    </Cluster>
  );
}
