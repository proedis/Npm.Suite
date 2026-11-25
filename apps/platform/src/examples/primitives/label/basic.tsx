import * as React from 'react';

import { TextInput } from '@proedis/ui/forms/text-input';
import { Stack } from '@proedis/ui/layout';
import { Label } from '@proedis/ui/primitives';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={2} className={'w-full max-w-xs'}>
      {/* htmlFor makes the name a <label>: clicking it focuses the field */}
      <Label htmlFor={'plate'} textId={'plate-label'} description={'As printed on the registration'} required>
        Plate number
      </Label>

      {/* The description is beside the name, never inside it: the control points at it */}
      <TextInput id={'plate'} aria-describedby={'plate-label-description'} aria-required placeholder={'FT-234-KL'} />
    </Stack>
  );
}
