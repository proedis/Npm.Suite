import * as React from 'react';

import { Checkbox, CheckboxGroup } from '@proedis/ui/forms/checkbox';
import { Field } from '@proedis/ui/forms/field';


export default function Example(): React.ReactNode {
  return (
    <Field>
      <Field.Label>Shifts</Field.Label>
      <CheckboxGroup orientation={{ base: 'vertical', sm: 'horizontal' }} defaultValue={[ 'morning' ]}>
        <Checkbox value={'morning'}>Morning</Checkbox>
        <Checkbox value={'afternoon'}>Afternoon</Checkbox>
        <Checkbox value={'night'}>Night</Checkbox>
      </CheckboxGroup>
      <Field.Description>A row from the sm breakpoint, a column on a phone.</Field.Description>
    </Field>
  );
}
