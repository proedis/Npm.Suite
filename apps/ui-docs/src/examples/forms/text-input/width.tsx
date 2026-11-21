import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { Form } from '@proedis/ui/forms/form';
import { TextInput } from '@proedis/ui/forms/text-input';


export default function Example(): React.ReactNode {
  return (
    <Form className={'w-full'}>
      <Form.Section>
        {/* width says what kind of value it is; span says how many of the six columns the field takes */}
        <Field span={1}>
          <Field.Label>short</Field.Label>
          <TextInput width={'short'} defaultValue={'10023'} />
        </Field>
        <Field span={2}>
          <Field.Label>code</Field.Label>
          <TextInput width={'code'} defaultValue={'AB 123 CD'} />
        </Field>
        <Field span={3}>
          <Field.Label>default</Field.Label>
          <TextInput defaultValue={'Chieri'} />
        </Field>
        <Field span={4}>
          <Field.Label>long</Field.Label>
          <TextInput width={'long'} defaultValue={'Strada Cambiano, 70'} />
        </Field>
      </Form.Section>
    </Form>
  );
}
