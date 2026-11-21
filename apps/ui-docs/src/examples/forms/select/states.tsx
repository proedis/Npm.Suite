import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { Select } from '@proedis/ui/forms/select';
import { Stack } from '@proedis/ui/layout';

import labels from './labels';
import { DEPOTS } from './options';


export default function Example(): React.ReactNode {
  return (
    <Stack columns={{ base: 1, sm: 2 }} gap={5} className={'w-full max-w-xl'}>
      <Field>
        <Field.Label>Read only</Field.Label>
        <Select options={DEPOTS} defaultValue={'pinerolo'} readOnly labels={labels} />
        <Field.Description>Reachable and selectable, it does not open.</Field.Description>
      </Field>

      <Field disabled>
        <Field.Label>Disabled</Field.Label>
        <Select options={DEPOTS} defaultValue={'pinerolo'} labels={labels} />
        <Field.Description>Out of the Tab order.</Field.Description>
      </Field>

      <Field>
        <Field.Label required>Invalid</Field.Label>
        <Select options={DEPOTS} placeholder={'Select'} labels={labels} />
        <Field.Error>Choose the depot of the round</Field.Error>
      </Field>

      <Field>
        <Field.Label>Loading</Field.Label>
        <Select options={[]} placeholder={'Select'} loading loadingLabel={'Loading the depots'} labels={labels} />
        <Field.Description>Keeps its value, does not open.</Field.Description>
      </Field>
    </Stack>
  );
}
