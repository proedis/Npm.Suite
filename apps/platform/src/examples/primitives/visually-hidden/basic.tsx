import * as React from 'react';

import { Stack } from '@proedis/ui/layout';
import { VisuallyHidden } from '@proedis/ui/primitives';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={3} className={'text-sm text-foreground'}>
      {/* Obvious to the eye from the column, silent to a screen reader without the unit */}
      <p className={'tabular-nums'}>
        1,204
        <VisuallyHidden> kilograms collected today</VisuallyHidden>
      </p>
      <p>
        Step 2 of 4
        <VisuallyHidden>, current step</VisuallyHidden>
      </p>
    </Stack>
  );
}
