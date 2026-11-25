import * as React from 'react';

import { Bell } from 'lucide-react';

import { IconButton } from '@proedis/ui/actions/button';
import { BadgeCounter } from '@proedis/ui/display/badge-counter';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={0} as={'span'} inline className={'relative'}>
      {/* The name stays "Jobs" for voice control; the count reaches a screen reader as a description */}
      <IconButton label={'Jobs'} icon={<Bell />} aria-describedby={'jobs-count'} />
      <BadgeCounter count={3} tone={'info'} />
      <span id={'jobs-count'} hidden>3 to look at</span>
    </Stack>
  );
}
