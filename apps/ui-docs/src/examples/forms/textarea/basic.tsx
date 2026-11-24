import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { Textarea } from '@proedis/ui/forms/textarea';


export default function Example(): React.ReactNode {
  return (
    <Field className={'w-full max-w-md'} label={'Notes'}>
      <Textarea placeholder={'E.g. wet material, weigh twice'} />
    </Field>
  );
}
