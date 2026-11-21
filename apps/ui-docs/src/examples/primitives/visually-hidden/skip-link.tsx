import * as React from 'react';

import { Stack } from '@proedis/ui/layout';
import { VisuallyHidden } from '@proedis/ui/primitives';


/** Press Tab with the focus just before this example: the link appears, and leaves again on blur */
export default function Example(): React.ReactNode {
  return (
    <Stack gap={3} align={'start'} className={'text-sm'}>
      <VisuallyHidden
        as={'a'}
        focusable
        href={'#skip-target'}
        className={'rounded-md bg-primary px-3 py-2 font-medium text-primary-foreground'}
      >
        Skip to the list of rounds
      </VisuallyHidden>
      <p className={'text-muted-foreground'}>A long navigation would sit here.</p>
      <p id={'skip-target'} tabIndex={-1} className={'font-medium text-foreground'}>The list of rounds starts here.</p>
    </Stack>
  );
}
