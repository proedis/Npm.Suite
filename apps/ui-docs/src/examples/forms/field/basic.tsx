import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { TextInput } from '@proedis/ui/forms/text-input';


export default function Example(): React.ReactNode {
  return (
    <Field className={'w-full max-w-sm'}>
      <Field.Label>Collection point</Field.Label>
      <TextInput placeholder={'E.g. Via Roma 12'} />
      <Field.Description>The address the vehicle stops at</Field.Description>
    </Field>
  );
}
