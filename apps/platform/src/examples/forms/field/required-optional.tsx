import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { TextInput } from '@proedis/ui/forms/text-input';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={5} className={'w-full max-w-sm'}>
      <Field required label={'Plate'}>
        <TextInput placeholder={'AB 123 CD'} />
      </Field>

      <Field optional={'optional'} label={'Fleet number'}>
        <TextInput placeholder={'E.g. 214'} />
      </Field>
    </Stack>
  );
}
