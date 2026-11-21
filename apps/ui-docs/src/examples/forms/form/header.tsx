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
      <Form.Header title={'Company details'} description={'Printed on every invoice and transport document'} />

      <Form.Section>
        <Field span={4}>
          <Field.Label required>Company name</Field.Label>
          <TextInput defaultValue={'Proedis S.r.l.'} />
        </Field>
        <Field span={2}>
          <Field.Label required>VAT number</Field.Label>
          <TextInput width={'code'} prefix={'IT'} defaultValue={'01234567890'} />
        </Field>
      </Form.Section>

      <Form.Footer>
        <Button fill={'plain'} tone={'muted'}>Discard changes</Button>
        <Button type={'submit'}>Save</Button>
      </Form.Footer>
    </Form>
  );
}
