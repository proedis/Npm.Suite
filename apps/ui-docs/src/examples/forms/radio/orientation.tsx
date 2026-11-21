import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { Radio, RadioGroup } from '@proedis/ui/forms/radio';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={6}>
      <Field>
        <Field.Label>Shift</Field.Label>
        <RadioGroup orientation={{ base: 'vertical', sm: 'horizontal' }} defaultValue={'morning'}>
          <Radio value={'morning'}>Morning</Radio>
          <Radio value={'afternoon'}>Afternoon</Radio>
          <Radio value={'night'}>Night</Radio>
        </RadioGroup>
      </Field>
      <Field>
        <Field.Label>Bin size</Field.Label>
        <RadioGroup variant={'card'} orientation={{ base: 'vertical', md: 'horizontal' }} defaultValue={'240'}>
          <Radio value={'120'} description={'One or two people.'}>120 l</Radio>
          <Radio value={'240'} description={'A family.'}>240 l</Radio>
          <Radio value={'1100'} description={'A building.'}>1,100 l</Radio>
        </RadioGroup>
      </Field>
    </Stack>
  );
}
