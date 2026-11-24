import * as React from 'react';

import { TextInput } from '@proedis/ui/forms/text-input';
import { Stack } from '@proedis/ui/layout';
import { Label } from '@proedis/ui/primitives';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={2} className={'w-full max-w-xs'}>
      <Stack gap={0.5}>
        {/* A <label> by default: clicking the name focuses the field */}
        <Label htmlFor={'plate'} required>Plate number</Label>

        {/* A sibling, never inside: the control points at it */}
        <Label.Description id={'plate-description'}>As printed on the registration</Label.Description>
      </Stack>
      <TextInput id={'plate'} aria-describedby={'plate-description'} aria-required placeholder={'FT-234-KL'} />
    </Stack>
  );
}
