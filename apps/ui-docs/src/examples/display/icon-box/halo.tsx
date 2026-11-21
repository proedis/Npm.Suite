import * as React from 'react';

import { Inbox, SearchX } from 'lucide-react';

import { IconBox } from '@proedis/ui/display/icon-box';
import { Cluster } from '@proedis/ui/layout';


/** For an empty state: the rings scale from the box, so they follow any size */
export default function Example(): React.ReactNode {
  return (
    <Cluster gap={16} className={'py-8'}>
      <IconBox size={'2xl'} tone={'primary'} halo><Inbox /></IconBox>
      <IconBox size={'xl'} tone={'muted'} halo><SearchX /></IconBox>
    </Cluster>
  );
}
