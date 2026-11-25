import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { TextInput } from '@proedis/ui/forms/text-input';


export default function Example(): React.ReactNode {
  return (
    <Field className={'w-full max-w-sm'} label={'Collection point'} description={'The address the vehicle stops at'}>
      <TextInput placeholder={'E.g. Via Roma 12'} />
    </Field>
  );
}
