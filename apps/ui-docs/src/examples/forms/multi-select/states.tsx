import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { MultiSelect } from '@proedis/ui/forms/multi-select';
import { Stack } from '@proedis/ui/layout';

import labels from './labels';
import { WASTE } from './options';


/** Garden waste is no longer collected: chosen on an old round, it stays, with no x */
const OPTIONS = WASTE.map((option) => (option.value === 'green' ? { ...option, label: 'Garden waste (ended)', disabled: true } : option));


export default function Example(): React.ReactNode {
  return (
    <Stack columns={{ base: 1, sm: 2 }} gap={5} className={'w-full max-w-2xl'}>
      <Field>
        <Field.Label>Read only</Field.Label>
        <MultiSelect options={WASTE} defaultValue={[ 'paper', 'plastic', 'glass', 'organic', 'residual' ]} readOnly labels={labels} />
        <Field.Description>Every value in view, the chips wrap.</Field.Description>
      </Field>

      <Field>
        <Field.Label>A value no longer offered</Field.Label>
        <MultiSelect options={OPTIONS} defaultValue={[ 'paper', 'green' ]} labels={labels} />
        <Field.Description>Its chip has no x.</Field.Description>
      </Field>

      <Field>
        <Field.Label>Invalid</Field.Label>
        <MultiSelect options={WASTE} placeholder={'Select'} labels={labels} />
        <Field.Error>Choose at least one kind</Field.Error>
      </Field>

      <Field disabled>
        <Field.Label>Disabled</Field.Label>
        <MultiSelect options={WASTE} defaultValue={[ 'paper' ]} labels={labels} />
        <Field.Description>Out of the Tab order.</Field.Description>
      </Field>

      <Field>
        <Field.Label>Loading</Field.Label>
        <MultiSelect options={[]} placeholder={'Select'} loading loadingLabel={'Loading the kinds of waste'} labels={labels} />
        <Field.Description>It does not open until the options arrive.</Field.Description>
      </Field>
    </Stack>
  );
}
