import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { Spacer, Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={3} className={'h-72 w-64 rounded-lg border border-border p-4'}>
      <p className={'font-semibold text-foreground'}>Plan A, monthly</p>
      <p className={'text-sm text-muted-foreground'}>Up to 20 vehicles and five depots.</p>
      {/* Takes the free height, so the button sits at the bottom of every card of the row */}
      <Spacer />
      <Button block fill={'soft'}>Choose</Button>
    </Stack>
  );
}
