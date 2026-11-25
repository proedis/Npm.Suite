import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { MultiSelect } from '@proedis/ui/forms/multi-select';

import labels from './labels';
import { TOWNS } from './options';


export default function Example(): React.ReactNode {
  return (
    <Field
      className={'w-full max-w-sm'}
      label={'Towns'}
      description={'Type “torinese”, then “Select all”: only the five found are checked.'}
    >
      <MultiSelect options={TOWNS} placeholder={'Select'} labels={labels} />
    </Field>
  );
}
