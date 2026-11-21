import * as React from 'react';

import { Bell, Inbox, RefreshCw } from 'lucide-react';

import { IconButton } from '@proedis/ui/actions/button';
import { BadgeCounter } from '@proedis/ui/display/badge-counter';
import { Cluster, Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Cluster gap={6}>
      <Stack as={'span'} inline className={'relative'}>
        <IconButton label={'Messages'} icon={<Inbox />} aria-describedby={'counter-messages'} />
        <BadgeCounter count={4} tone={'info'} />
        <span id={'counter-messages'} hidden>4 unread</span>
      </Stack>
      <Stack as={'span'} inline className={'relative'}>
        <IconButton label={'Synchronisations'} icon={<RefreshCw />} aria-describedby={'counter-sync'} />
        <BadgeCounter count={2} tone={'destructive'} />
        <span id={'counter-sync'} hidden>2 failed</span>
      </Stack>
      <Stack as={'span'} inline className={'relative'}>
        <IconButton label={'Alerts'} icon={<Bell />} aria-describedby={'counter-alerts'} />
        <BadgeCounter count={27} tone={'info'} />
        <span id={'counter-alerts'} hidden>27 to look at</span>
      </Stack>
      <Stack as={'span'} inline className={'relative'}>
        <IconButton label={'Alerts'} icon={<Bell />} aria-describedby={'counter-alerts-max'} />
        <BadgeCounter count={140} max={99} tone={'info'} />
        <span id={'counter-alerts-max'} hidden>140 to look at</span>
      </Stack>
    </Cluster>
  );
}
