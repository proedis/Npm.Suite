import * as React from 'react';

import { Stack } from '@proedis/ui/layout';
import { Label } from '@proedis/ui/primitives';


/** The two marks: the asterisk of a required value, the word of an optional one in a form of required fields */
export default function Example(): React.ReactNode {
  return (
    <Stack direction={'horizontal'} gap={'xl'}>
      <Label as={'span'} required>Plate</Label>
      <Label as={'span'} optional={'optional'}>Second driver</Label>
      <Label as={'span'} emphasis={'regular'}>Weigh at the pick-up</Label>
    </Stack>
  );
}
