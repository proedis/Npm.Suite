import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { Radio, RadioGroup } from '@proedis/ui/forms/radio';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack columns={{ base: 1, md: 3 }} gap={6}>
      <Field label={'Disabled option'}>
        <RadioGroup defaultValue={'diesel'}>
          <Radio value={'diesel'}>Diesel</Radio>
          <Radio value={'methane'}>Methane</Radio>
          <Radio value={'electric'} disabled description={'No charging point at this depot.'}>Electric</Radio>
        </RadioGroup>
      </Field>
      <Field label={'Read only'}>
        <RadioGroup readOnly defaultValue={'methane'}>
          <Radio value={'diesel'}>Diesel</Radio>
          <Radio value={'methane'}>Methane</Radio>
          <Radio value={'electric'}>Electric</Radio>
        </RadioGroup>
      </Field>
      <Field required label={'Invalid'} error={'Choose the fuel'}>
        <RadioGroup>
          <Radio value={'diesel'}>Diesel</Radio>
          <Radio value={'methane'}>Methane</Radio>
          <Radio value={'electric'}>Electric</Radio>
        </RadioGroup>
      </Field>
    </Stack>
  );
}
