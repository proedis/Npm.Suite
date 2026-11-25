import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { Select } from '@proedis/ui/forms/select';

import labels from './labels';
import { DEPOTS } from './options';


export default function Example(): React.ReactNode {
  return (
    <Field className={'w-full max-w-xs'} label={'Depot'} description={'Where the vehicle starts and ends its round.'}>
      <Select options={DEPOTS} placeholder={'Select'} labels={labels} />
    </Field>
  );
}
