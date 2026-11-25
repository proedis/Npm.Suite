import * as React from 'react';

import { Stack } from '@proedis/ui/layout';
import { Label } from '@proedis/ui/primitives';


/** With no control to point at, a span: the quiet register lets the value be the point */
export default function Example(): React.ReactNode {
  return (
    <Stack columns={{ base: 1, sm: 3 }} gap={6} className={'w-full max-w-lg'}>
      <Stack gap={1}>
        <Label as={'span'} emphasis={'quiet'}>Collected today</Label>
        <span className={'text-lg font-semibold text-foreground'}>1,204 kg</span>
      </Stack>
      <Stack gap={1}>
        <Label emphasis={'quiet'} description={'Of the 38 planned'}>Stops done</Label>
        <span className={'text-lg font-semibold text-foreground'}>29</span>
      </Stack>
      <Stack gap={1}>
        <Label as={'span'} emphasis={'quiet'}>Back at the depot</Label>
        <span className={'text-lg font-semibold text-foreground'}>13:40</span>
      </Stack>
    </Stack>
  );
}
