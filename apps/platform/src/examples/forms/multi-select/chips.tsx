import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { MultiSelect } from '@proedis/ui/forms/multi-select';
import { Stack } from '@proedis/ui/layout';

import labels from './labels';
import { TOWNS } from './options';


/** Fourteen of the twenty towns */
const SERVED = TOWNS.slice(0, 14).map((town) => town.value);


export default function Example(): React.ReactNode {
  return (
    <Stack gap={5} className={'w-full max-w-sm'}>
      <Field label={'Towns served'} description={'Three chips, then “+11”: hover it to read the rest.'}>
        <MultiSelect options={TOWNS} defaultValue={SERVED} labels={labels} />
      </Field>

      <Field label={'Towns served, one chip'} description={'Where the field is narrow, a single chip and the count.'}>
        <MultiSelect options={TOWNS} defaultValue={SERVED} maxChips={1} labels={labels} />
      </Field>
    </Stack>
  );
}
