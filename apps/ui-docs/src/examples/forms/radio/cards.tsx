import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { Radio, RadioGroup } from '@proedis/ui/forms/radio';


export default function Example(): React.ReactNode {
  return (
    <Field className={'w-full max-w-md'}>
      <Field.Label required>Billing</Field.Label>
      <RadioGroup variant={'card'} defaultValue={'weight'}>
        <Radio value={'flat'} description={'The same amount every month, whatever is collected.'}>Flat fee</Radio>
        <Radio value={'weight'} description={'Each pick-up is weighed, and the weight is invoiced.'}>By weight</Radio>
        <Radio value={'emptying'} description={'Each emptying counts once, read by the tag on the bin.'}>By emptying</Radio>
      </RadioGroup>
      <Field.Description>Changing it takes effect from the next invoice.</Field.Description>
    </Field>
  );
}
