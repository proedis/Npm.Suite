import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { Select } from '@proedis/ui/forms/select';

import labels from './labels';
import { TOWNS } from './options';


export default function Example(): React.ReactNode {
  return (
    <Field className={'w-full max-w-xs'}>
      <Field.Label>Town</Field.Label>
      <Select options={TOWNS} placeholder={'Select'} labels={labels} />
      <Field.Description>Twenty towns: open it and type “cantu” or “forli”.</Field.Description>
    </Field>
  );
}
