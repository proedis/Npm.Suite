import * as React from 'react';

import { Bell, Inbox } from 'lucide-react';

import { IconButton } from '@proedis/ui/actions/button';
import { BadgeDot } from '@proedis/ui/display/badge-dot';
import { IconBox } from '@proedis/ui/display/icon-box';
import { Cluster, Stack } from '@proedis/ui/layout';


/** A corner needs a positioned parent: an inline Stack with `relative` here */
export default function Example(): React.ReactNode {
  return (
    <Cluster gap={'lg'}>
      <Stack as={'span'} inline className={'relative'}>
        <IconButton label={'Notifications, something new'} icon={<Bell />} />
        <BadgeDot tone={'destructive'} placement={'top-end'} ring />
      </Stack>
      <Stack as={'span'} inline className={'relative'}>
        <IconBox tone={'primary'}><Inbox /></IconBox>
        <BadgeDot tone={'info'} placement={'bottom-end'} size={'md'} ring />
      </Stack>
    </Cluster>
  );
}
