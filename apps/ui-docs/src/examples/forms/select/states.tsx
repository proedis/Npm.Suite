import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { Select } from '@proedis/ui/forms/select';
import { Stack } from '@proedis/ui/layout';

import labels from './labels';
import { DEPOTS } from './options';


export default function Example(): React.ReactNode {
  return (
    <Stack columns={{ base: 1, sm: 2 }} gap={5} className={'w-full max-w-xl'}>
      <Field label={'Read only'} description={'Reachable and selectable, it does not open.'}>
        <Select options={DEPOTS} defaultValue={'pinerolo'} readOnly labels={labels} />
      </Field>

      <Field disabled label={'Disabled'} description={'Out of the Tab order.'}>
        <Select options={DEPOTS} defaultValue={'pinerolo'} labels={labels} />
      </Field>

      <Field required label={'Invalid'} error={'Choose the depot of the round'}>
        <Select options={DEPOTS} placeholder={'Select'} labels={labels} />
      </Field>

      <Field label={'Loading'} description={'Keeps its value, does not open.'}>
        <Select options={[]} placeholder={'Select'} loading loadingLabel={'Loading the depots'} labels={labels} />
      </Field>
    </Stack>
  );
}
