import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { Select } from '@proedis/ui/forms/select';
import { Stack } from '@proedis/ui/layout';

import labels from './labels';
import { DEPOTS } from './options';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={5} className={'w-full max-w-xs'}>
      <Field required label={'Depot'} description={'Required: no button to empty it.'}>
        <Select options={DEPOTS} defaultValue={'chieri'} labels={labels} />
      </Field>

      <Field
        optional={'optional'}
        label={'Backup depot'}
        description={'Optional: the x empties it, and so do Delete and Backspace.'}
      >
        <Select options={DEPOTS} defaultValue={'rivoli'} placeholder={'Select'} labels={labels} />
      </Field>
    </Stack>
  );
}
