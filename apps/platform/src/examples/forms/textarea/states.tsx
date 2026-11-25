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
      <Field label={'Read only, as tall as its text'}>
        <Textarea readOnly defaultValue={NOTE} />
      </Field>
      <Field label={'Invalid'} error={'Write at least a sentence'}>
        <Textarea defaultValue={'??'} />
      </Field>
      <Field disabled label={'Disabled'}>
        <Textarea defaultValue={'Locked after the round is closed'} />
      </Field>
    </Stack>
  );
}
