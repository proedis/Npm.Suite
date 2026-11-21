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
      <Field>
        <Field.Label>Towns served</Field.Label>
        <MultiSelect options={TOWNS} defaultValue={SERVED} labels={labels} />
        <Field.Description>Three chips, then “+11”: hover it to read the rest.</Field.Description>
      </Field>

      <Field>
        <Field.Label>Towns served, one chip</Field.Label>
        <MultiSelect options={TOWNS} defaultValue={SERVED} maxChips={1} labels={labels} />
        <Field.Description>Where the field is narrow, a single chip and the count.</Field.Description>
      </Field>
    </Stack>
  );
}
