import * as React from 'react';

import { DatePicker } from '@proedis/ui/forms/date-picker';
import { Field } from '@proedis/ui/forms/field';
import { Stack } from '@proedis/ui/layout';

import labels from './labels';


export default function Example(): React.ReactNode {
  return (
    <Stack columns={{ base: 1, sm: 2 }} gap={5} className={'w-full max-w-xl'}>
      <Field required label={'Required'} description={'No x and no “Clear”.'}>
        <DatePicker locale={'en-GB'} defaultValue={'2026-11-16'} labels={labels} />
      </Field>

      <Field label={'Small'} description={'For a filter bar or a table.'}>
        <DatePicker size={'sm'} locale={'en-GB'} defaultValue={'2026-11-16'} labels={labels} />
      </Field>

      <Field label={'Read only'} description={'Reachable, nothing opens.'}>
        <DatePicker readOnly locale={'en-GB'} defaultValue={'2026-11-16'} labels={labels} />
      </Field>

      <Field disabled label={'Disabled'} description={'Out of the Tab order.'}>
        <DatePicker locale={'en-GB'} defaultValue={'2026-11-16'} labels={labels} />
      </Field>

      <Field label={'Invalid'} error={'Choose the date of the collection'}>
        <DatePicker locale={'en-GB'} labels={labels} />
      </Field>
    </Stack>
  );
}
