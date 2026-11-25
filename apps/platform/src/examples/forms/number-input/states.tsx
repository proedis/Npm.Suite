import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { NumberInput } from '@proedis/ui/forms/number-input';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack columns={{ base: 1, sm: 2 }} gap={5} className={'w-full max-w-xl'}>
      <Field label={'Read only'}>
        <NumberInput readOnly defaultValue={18.4} decimals={1} suffix={'t'} locale={'en-GB'} />
      </Field>
      <Field disabled label={'Disabled'}>
        <NumberInput defaultValue={3} max={10} />
      </Field>
      <Field label={'Loading'}>
        <NumberInput defaultValue={1200} max={9999} suffix={'kg'} loading loadingLabel={'Reading the scale'} locale={'en-GB'} />
      </Field>
      <Field label={'Small'}>
        <NumberInput size={'sm'} defaultValue={7} max={99} />
      </Field>
    </Stack>
  );
}
