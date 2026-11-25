import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { Stack } from '@proedis/ui/layout';
import { Divider } from '@proedis/ui/primitives';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={4} className={'w-full max-w-sm'}>
      <Button block size={'lg'}>Sign in with the company account</Button>
      <Divider label={'or'} />
      <Button block size={'lg'} fill={'soft'} tone={'secondary'}>Sign in with an email</Button>
    </Stack>
  );
}
