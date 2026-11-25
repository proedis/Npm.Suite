import * as React from 'react';

import { Inbox } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { IconBox } from '@proedis/ui/display/icon-box';
import { Center, Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Center minHeight={280} maxWidth={320} className={'w-full rounded-lg border border-dashed border-border'}>
      <Stack align={'center'} gap={3} className={'text-center'}>
        <IconBox size={'lg'} fill={'soft'} tone={'secondary'}><Inbox /></IconBox>
        <p className={'font-semibold text-foreground'}>No rounds today</p>
        <p className={'text-sm text-muted-foreground'}>Rounds planned for today show up here, ordered by their start time.</p>
        <Button fill={'soft'}>Plan a round</Button>
      </Stack>
    </Center>
  );
}
