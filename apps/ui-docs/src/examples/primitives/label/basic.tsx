import * as React from 'react';

import { TextInput } from '@proedis/ui/forms/text-input';
import { Stack } from '@proedis/ui/layout';
import { Label } from '@proedis/ui/primitives';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={2} className={'w-full max-w-xs'}>
      {/* A <label> by default: clicking the name focuses the field */}
      <Label htmlFor={'plate'} description={'As printed on the registration'}>Plate number</Label>
      <TextInput id={'plate'} placeholder={'FT-234-KL'} />
    </Stack>
  );
}
