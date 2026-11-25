import * as React from 'react';

import { Field, FIELD_SPAN } from '@proedis/ui/forms/field';
import { Form } from '@proedis/ui/forms/form';
import { TextInput } from '@proedis/ui/forms/text-input';


export default function Example(): React.ReactNode {
  return (
    <Form className={'w-full'}>
      <Form.Section title={'Spans'}>
        <Field span={6} label={'span 6'}>
          <TextInput />
        </Field>
        <Field span={4} label={'span 4'}>
          <TextInput width={'long'} />
        </Field>
        <Field span={2} label={'span 2'}>
          <TextInput width={'code'} />
        </Field>
        <Field span={3} label={'span 3, the default'}>
          <TextInput />
        </Field>
        <Field span={1} label={'span 1'}>
          <TextInput width={'short'} />
        </Field>

        {/* A new row, even though one column is still free above */}
        <Field span={FIELD_SPAN['text-code']} breakBefore label={'breakBefore'}>
          <TextInput width={'code'} />
        </Field>
      </Form.Section>
    </Form>
  );
}
