import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { Form } from '@proedis/ui/forms/form';
import { NumberInput } from '@proedis/ui/forms/number-input';
import { TextInput } from '@proedis/ui/forms/text-input';


export default function Example(): React.ReactNode {
  return (
    <Form className={'w-full max-w-2xl'}>
      <Form.Section title={'Address'} description={'Where the collection takes place'}>
        <Field span={4}>
          <Field.Label required>Street</Field.Label>
          <TextInput width={'long'} />
        </Field>
        <Field span={2}>
          <Field.Label required>Number</Field.Label>
          <TextInput width={'code'} />
        </Field>
        <Field span={2}>
          <Field.Label required>Postcode</Field.Label>
          <TextInput width={'short'} inputMode={'numeric'} />
        </Field>
        <Field span={4}>
          <Field.Label required>Town</Field.Label>
          <TextInput />
        </Field>
      </Form.Section>

      <Form.Section title={'Containers'} description={'What stands at the point today'}>
        <Field span={2}>
          <Field.Label>Bins</Field.Label>
          <NumberInput defaultValue={4} max={99} />
        </Field>
        <Field span={2}>
          <Field.Label>Capacity each</Field.Label>
          <NumberInput defaultValue={1100} max={5000} suffix={'L'} locale={'en-GB'} />
        </Field>
      </Form.Section>
    </Form>
  );
}
