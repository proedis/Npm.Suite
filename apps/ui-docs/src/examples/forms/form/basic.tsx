import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { Field } from '@proedis/ui/forms/field';
import { Form } from '@proedis/ui/forms/form';
import { TextInput } from '@proedis/ui/forms/text-input';


export default function Example(): React.ReactNode {
  const handleSubmit = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  }, []);

  return (
    <Form onSubmit={handleSubmit} className={'w-full max-w-2xl'}>
      <Form.Section>
        <Field span={4}>
          <Field.Label required>Street</Field.Label>
          <TextInput width={'long'} />
        </Field>
        <Field span={2}>
          <Field.Label required>Number</Field.Label>
          <TextInput width={'code'} />
        </Field>
      </Form.Section>

      <Form.Footer>
        <Button type={'submit'}>Save</Button>
      </Form.Footer>
    </Form>
  );
}
