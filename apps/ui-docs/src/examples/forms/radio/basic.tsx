import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { Radio, RadioGroup } from '@proedis/ui/forms/radio';


export default function Example(): React.ReactNode {
  return (
    <Field>
      <Field.Label required>Frequency</Field.Label>
      <RadioGroup defaultValue={'weekly'}>
        <Radio value={'weekly'}>Weekly</Radio>
        <Radio value={'fortnightly'}>Every two weeks</Radio>
        <Radio value={'monthly'} description={'On the first working day of the month.'}>Monthly</Radio>
      </RadioGroup>
      <Field.Description>How often the bins of the contract are emptied.</Field.Description>
    </Field>
  );
}
