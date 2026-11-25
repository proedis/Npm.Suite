import * as React from 'react';

import { DurationInput } from '@proedis/ui/forms/duration-input';
import { Field } from '@proedis/ui/forms/field';
import { Stack } from '@proedis/ui/layout';

import labels from './labels';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={4} className={'w-full max-w-sm'}>
      <Field label={'Break'} description={'Minutes are enough: hh:mm.'}>
        <DurationInput precision={'minutes'} defaultValue={45 * 60} labels={labels} />
      </Field>
      <Field label={'Time on site'} description={'Up to 240 hours: the hours take three digits.'}>
        <DurationInput max={240 * 3600} defaultValue={36 * 3600} labels={labels} />
      </Field>
    </Stack>
  );
}
