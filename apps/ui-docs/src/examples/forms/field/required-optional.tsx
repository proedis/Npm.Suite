import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { TextInput } from '@proedis/ui/forms/text-input';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={5} className={'w-full max-w-sm'}>
      <Field>
        <Field.Label required>Plate</Field.Label>
        <TextInput placeholder={'AB 123 CD'} />
      </Field>

      <Field>
        <Field.Label optional={'optional'}>Fleet number</Field.Label>
        <TextInput placeholder={'E.g. 214'} />
      </Field>
    </Stack>
  );
}
