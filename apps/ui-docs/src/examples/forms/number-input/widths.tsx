import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { NumberInput } from '@proedis/ui/forms/number-input';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={4}>
      <Field orientation={'horizontal'} label={'Bins (max 99)'}>
        <NumberInput defaultValue={4} max={99} />
      </Field>
      <Field orientation={'horizontal'} label={'Weight (max 44.000)'}>
        <NumberInput defaultValue={26000} max={44000} suffix={'kg'} locale={'it-IT'} />
      </Field>
      <Field orientation={'horizontal'} label={'Yearly fee (max 9.999.999,99)'}>
        <NumberInput defaultValue={1250000} max={9999999.99} decimals={2} suffix={'€'} locale={'it-IT'} />
      </Field>
      <Field orientation={'horizontal'} label={'No maximum'}>
        <NumberInput defaultValue={42} suffix={'tons'} locale={'en-GB'} />
      </Field>
    </Stack>
  );
}
