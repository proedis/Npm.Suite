import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { Field } from '@proedis/ui/forms/field';
import { Form } from '@proedis/ui/forms/form';
import { TextInput } from '@proedis/ui/forms/text-input';


interface Errors {
  name?: string;
  email?: string;
  phone?: string;
}

function validate(data: FormData): Errors {
  const errors: Errors = {};

  if (!String(data.get('name')).trim()) {
    errors.name = 'Write the name';
  }

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(data.get('email')))) {
    errors.email = 'Not an address';
  }

  if (!/^\+?[\d\s]{6,}$/.test(String(data.get('phone')))) {
    errors.phone = 'Digits only';
  }

  return errors;
}


export default function Example(): React.ReactNode {
  const [ errors, setErrors ] = React.useState<Errors>({});

  const handleSubmit = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors(validate(new FormData(event.currentTarget)));
  }, []);

  return (
    <Form onSubmit={handleSubmit} className={'w-full max-w-2xl'}>
      <Form.ErrorSummary title={(count) => (count === 1 ? 'One field to fix' : `${count} fields to fix`)} />

      <Form.Section title={'Contact person'}>
        <Field span={6} name={'name'}>
          <Field.Label required>Name</Field.Label>
          <TextInput name={'name'} />
          <Field.Error summary={'Name: write it'}>{errors.name}</Field.Error>
        </Field>
        <Field name={'email'}>
          <Field.Label required>Email</Field.Label>
          <TextInput name={'email'} type={'email'} defaultValue={'mario.rossi@'} />
          <Field.Error summary={'Email: it is not an address'}>{errors.email}</Field.Error>
        </Field>
        <Field name={'phone'}>
          <Field.Label required>Phone</Field.Label>
          <TextInput name={'phone'} type={'tel'} defaultValue={'011-94'} />
          <Field.Error summary={'Phone: digits only, at least six'}>{errors.phone}</Field.Error>
        </Field>
      </Form.Section>

      <Form.Footer>
        <Button type={'submit'}>Save contact</Button>
      </Form.Footer>
    </Form>
  );
}
