import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { Textarea } from '@proedis/ui/forms/textarea';
import { Stack } from '@proedis/ui/layout';


const NOTE = [
  'Collection moved to Thursday for the market.',
  'Bins 3 and 4 are behind the school gate: ring the caretaker.',
  'Glass only in the green bin.'
].join('\n');


export default function Example(): React.ReactNode {
  return (
    <Stack columns={{ base: 1, sm: 2 }} gap={5} className={'w-full max-w-2xl'}>
      <Field>
        <Field.Label>Read only, as tall as its text</Field.Label>
        <Textarea readOnly defaultValue={NOTE} />
      </Field>
      <Field>
        <Field.Label>Invalid</Field.Label>
        <Textarea defaultValue={'??'} />
        <Field.Error>Write at least a sentence</Field.Error>
      </Field>
      <Field disabled>
        <Field.Label>Disabled</Field.Label>
        <Textarea defaultValue={'Locked after the round is closed'} />
      </Field>
    </Stack>
  );
}
