import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { Form } from '@proedis/ui/forms/form';
import { TextInput } from '@proedis/ui/forms/text-input';


export default function Example(): React.ReactNode {
  return (
    <Form className={'w-full'}>
      <Form.Section title={'Contact'}>
        {/* A map speaks of the window: the whole row on a phone, half from md, a third from xl */}
        <Field span={{ base: 6, md: 3, xl: 2 }} label={'First name'}>
          <TextInput />
        </Field>
        <Field span={{ base: 6, md: 3, xl: 2 }} label={'Last name'}>
          <TextInput />
        </Field>
        <Field span={{ base: 6, xl: 2 }} label={'Role'}>
          <TextInput />
        </Field>
      </Form.Section>
    </Form>
  );
}
