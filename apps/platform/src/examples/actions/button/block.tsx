import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={3} className={'w-full max-w-sm'}>
      <Button block size={'lg'}>Sign in</Button>
      <Button block={{ base: true, sm: false }} fill={'soft'}>Full width on a phone only</Button>
    </Stack>
  );
}
