import * as React from 'react';

import { Checkbox, CheckboxGroup } from '@proedis/ui/forms/checkbox';
import { Field } from '@proedis/ui/forms/field';


export default function Example(): React.ReactNode {
  return (
    <Field
      label={'Documents on board'}
      description={'The parent changes what can change: the disabled and read-only boxes keep their value.'}
    >
      <CheckboxGroup defaultValue={[ 'form', 'licence' ]}>
        <Checkbox parent>All documents</Checkbox>
        <Checkbox value={'form'} disabled description={'Required by law on every transport.'}>Waste identification form</Checkbox>
        <Checkbox value={'licence'}>Operating licence</Checkbox>
        <Checkbox value={'insurance'}>Insurance certificate</Checkbox>
        <Checkbox value={'adr'} readOnly description={'Set by the fleet office.'}>ADR certificate</Checkbox>
      </CheckboxGroup>
    </Field>
  );
}
