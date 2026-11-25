import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { NumberInput } from '@proedis/ui/forms/number-input';
import { TextInput } from '@proedis/ui/forms/text-input';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={5} className={'w-full max-w-xl'}>
      <Field orientation={'horizontal'} label={'Depot'} description={'Where the rounds start and end'}>
        <TextInput defaultValue={'Chieri, Strada Cambiano'} />
      </Field>

      {/* Above the control on a phone, beside it from md */}
      <Field
        orientation={{ base: 'vertical', md: 'horizontal' }}
        label={'Daily capacity'}
        description={'Narrow the window to see the label move above'}
      >
        <NumberInput defaultValue={18000} max={99999} suffix={'kg'} locale={'en-GB'} />
      </Field>
    </Stack>
  );
}
