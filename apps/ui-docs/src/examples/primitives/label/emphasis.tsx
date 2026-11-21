import * as React from 'react';

import { Stack } from '@proedis/ui/layout';
import { Label } from '@proedis/ui/primitives';


export default function Example(): React.ReactNode {
  return (
    <Stack direction={{ base: 'vertical', sm: 'horizontal' }} gap={8}>
      <Label as={'span'}>Default</Label>
      <Label as={'span'} emphasis={'strong'}>Strong</Label>
      <Label as={'span'} emphasis={'quiet'}>Quiet</Label>
    </Stack>
  );
}
