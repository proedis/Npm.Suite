import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { Form } from '@proedis/ui/forms/form';
import { TextInput } from '@proedis/ui/forms/text-input';
import { Stack } from '@proedis/ui/layout';


/** The same section twice: the narrow one is under 32rem, measured on the section and not on the window */
function Address(): React.ReactNode {
  return (
    <Form.Section title={'Address'}>
      <Field span={4} label={'Street'}>
        <TextInput width={'long'} />
      </Field>
      <Field span={2} label={'Number'}>
        <TextInput width={'code'} />
      </Field>
      <Field span={1} label={'Floor'}>
        <TextInput width={'short'} />
      </Field>
      <Field span={1} label={'Unit'}>
        <TextInput width={'short'} />
      </Field>
    </Form.Section>
  );
}


export default function Example(): React.ReactNode {
  return (
    <Stack gap={10} className={'w-full'}>
      <Form>
        <Address />
      </Form>
      <Form className={'max-w-xs'}>
        <Address />
      </Form>
    </Stack>
  );
}
