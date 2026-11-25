import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { Radio, RadioGroup } from '@proedis/ui/forms/radio';


export default function Example(): React.ReactNode {
  return (
    <Field required label={'Frequency'} description={'How often the bins of the contract are emptied.'}>
      <RadioGroup defaultValue={'weekly'}>
        <Radio value={'weekly'}>Weekly</Radio>
        <Radio value={'fortnightly'}>Every two weeks</Radio>
        <Radio value={'monthly'} description={'On the first working day of the month.'}>Monthly</Radio>
      </RadioGroup>
    </Field>
  );
}
