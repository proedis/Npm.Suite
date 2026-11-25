import * as React from 'react';

import { DurationInput } from '@proedis/ui/forms/duration-input';
import { Field } from '@proedis/ui/forms/field';
import { Stack } from '@proedis/ui/layout';

import labels from './labels';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={4} className={'w-full max-w-sm'}>
      <Field label={'Small'}>
        <DurationInput size={'sm'} defaultValue={600} labels={labels} />
      </Field>
      <Field label={'Read only'}>
        <DurationInput readOnly defaultValue={5400} labels={labels} />
      </Field>
      <Field label={'Disabled'}>
        <DurationInput disabled defaultValue={5400} labels={labels} />
      </Field>
      <Field label={'With an error'} error={'The round cannot last more than 10 hours'}>
        <DurationInput defaultValue={11 * 3600} labels={labels} />
      </Field>
    </Stack>
  );
}
