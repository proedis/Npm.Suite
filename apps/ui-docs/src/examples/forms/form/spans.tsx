import * as React from 'react';

import { Field, FIELD_SPAN } from '@proedis/ui/forms/field';
import { Form } from '@proedis/ui/forms/form';
import { TextInput } from '@proedis/ui/forms/text-input';


export default function Example(): React.ReactNode {
  return (
    <Form className={'w-full'}>
      <Form.Section title={'Spans'}>
        <Field span={6}>
          <Field.Label>span 6</Field.Label>
          <TextInput />
        </Field>
        <Field span={4}>
          <Field.Label>span 4</Field.Label>
          <TextInput width={'long'} />
        </Field>
        <Field span={2}>
          <Field.Label>span 2</Field.Label>
          <TextInput width={'code'} />
        </Field>
        <Field span={3}>
          <Field.Label>span 3, the default</Field.Label>
          <TextInput />
        </Field>
        <Field span={1}>
          <Field.Label>span 1</Field.Label>
          <TextInput width={'short'} />
        </Field>

        {/* A new row, even though one column is still free above */}
        <Field span={FIELD_SPAN['text-code']} breakBefore>
          <Field.Label>breakBefore</Field.Label>
          <TextInput width={'code'} />
        </Field>
      </Form.Section>
    </Form>
  );
}
