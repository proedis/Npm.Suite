import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { TextInput } from '@proedis/ui/forms/text-input';


export default function Example(): React.ReactNode {
  return (
    <Field className={'w-full max-w-sm'}>
      <Field.Label required>Town</Field.Label>
      <TextInput placeholder={'E.g. Chieri'} />
    </Field>
  );
}
