import * as React from 'react';

import { DatePicker } from '@proedis/ui/forms/date-picker';
import { Field } from '@proedis/ui/forms/field';
import { Stack } from '@proedis/ui/layout';

import labels from './labels';


export default function Example(): React.ReactNode {
  return (
    <Stack columns={{ base: 1, sm: 2 }} gap={5} className={'w-full max-w-xl'}>
      <Field>
        <Field.Label required>Required</Field.Label>
        <DatePicker locale={'en-GB'} defaultValue={'2026-11-16'} labels={labels} />
        <Field.Description>No x and no “Clear”.</Field.Description>
      </Field>

      <Field>
        <Field.Label>Small</Field.Label>
        <DatePicker size={'sm'} locale={'en-GB'} defaultValue={'2026-11-16'} labels={labels} />
        <Field.Description>For a filter bar or a table.</Field.Description>
      </Field>

      <Field>
        <Field.Label>Read only</Field.Label>
        <DatePicker readOnly locale={'en-GB'} defaultValue={'2026-11-16'} labels={labels} />
        <Field.Description>Reachable, nothing opens.</Field.Description>
      </Field>

      <Field disabled>
        <Field.Label>Disabled</Field.Label>
        <DatePicker locale={'en-GB'} defaultValue={'2026-11-16'} labels={labels} />
        <Field.Description>Out of the Tab order.</Field.Description>
      </Field>

      <Field>
        <Field.Label>Invalid</Field.Label>
        <DatePicker locale={'en-GB'} labels={labels} />
        <Field.Error>Choose the date of the collection</Field.Error>
      </Field>
    </Stack>
  );
}
