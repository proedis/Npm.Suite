import * as React from 'react';

import { Surface } from '@proedis/ui/display/surface';
import { Bleed, Stack } from '@proedis/ui/layout';
import { Divider } from '@proedis/ui/primitives';


export default function Example(): React.ReactNode {
  return (
    <Surface radius={'xl'} className={'w-full max-w-sm p-6'}>
      <Stack gap={4}>
        <p className={'font-semibold text-foreground'}>Order 2026/1184</p>
        {/* The card pads by 6 steps: inset={6} takes the line to its edges */}
        <Bleed inset={6}>
          <Divider />
        </Bleed>
        <p className={'text-sm text-muted-foreground'}>Two containers, one skip, delivered on Thursday.</p>
      </Stack>
    </Surface>
  );
}
