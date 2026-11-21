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
        className={'rounded-md bg-primary font-medium text-primary-foreground'}
      >
        {/* The padding inside: once focused, not-sr-only resets the padding of the link itself to 0 */}
        <span className={'block px-3 py-2'}>Skip to the list of rounds</span>
      </VisuallyHidden>
      <p className={'text-muted-foreground'}>A long navigation would sit here.</p>
      <p id={'skip-target'} tabIndex={-1} className={'font-medium text-foreground'}>The list of rounds starts here.</p>
    </Stack>
  );
}
