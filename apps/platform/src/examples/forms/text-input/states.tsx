import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { TextInput } from '@proedis/ui/forms/text-input';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack columns={{ base: 1, sm: 2 }} gap={5} className={'w-full max-w-2xl'}>
      <Field label={'Default'}>
        <TextInput placeholder={'Placeholder'} />
      </Field>
      <Field label={'Invalid'} error={'Not found in the street list'}>
        <TextInput defaultValue={'Via Romaa'} />
      </Field>
      <Field label={'Read only'}>
        <TextInput readOnly defaultValue={'Comune di Chieri'} placeholder={'Hidden when read only'} />
      </Field>
      <Field disabled label={'Disabled'}>
        <TextInput defaultValue={'CT-2026-0148'} />
      </Field>
    </Stack>
  );
}
