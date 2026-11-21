import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { TextInput } from '@proedis/ui/forms/text-input';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack columns={{ base: 1, sm: 2 }} gap={5} className={'w-full max-w-2xl'}>
      <Field>
        <Field.Label>Default</Field.Label>
        <TextInput placeholder={'Placeholder'} />
      </Field>
      <Field>
        <Field.Label>Invalid</Field.Label>
        <TextInput defaultValue={'Via Romaa'} />
        <Field.Error>Not found in the street list</Field.Error>
      </Field>
      <Field>
        <Field.Label>Read only</Field.Label>
        <TextInput readOnly defaultValue={'Comune di Chieri'} placeholder={'Hidden when read only'} />
      </Field>
      <Field disabled>
        <Field.Label>Disabled</Field.Label>
        <TextInput defaultValue={'CT-2026-0148'} />
      </Field>
    </Stack>
  );
}
