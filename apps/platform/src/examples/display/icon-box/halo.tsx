import * as React from 'react';

import { Inbox, SearchX } from 'lucide-react';

import { IconBox } from '@proedis/ui/display/icon-box';
import { Center, Stack } from '@proedis/ui/layout';


/** For an empty state: the rings are a quarter and a half of the side, so they need that much room around */
export default function Example(): React.ReactNode {
  return (
    <Stack columns={2} className={'w-full py-12'}>
      <Center><IconBox size={'2xl'} tone={'primary'} halo><Inbox /></IconBox></Center>
      <Center><IconBox size={'xl'} tone={'muted'} halo><SearchX /></IconBox></Center>
    </Stack>
  );
}
