import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { Form } from '@proedis/ui/forms/form';
import { TextInput } from '@proedis/ui/forms/text-input';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    /* The corner of this box sets the container; the handle of the preview sets the window */
    <Stack gap={0} className={'w-full resize-x overflow-auto rounded-xl border border-dashed border-border p-4'}>
      <Form>
        <Form.Section title={'One value: the section decides'}>
          <Field span={2}>
            <Field.Label>ZIP code</Field.Label>
            <TextInput />
          </Field>
          <Field span={4}>
            <Field.Label>City</Field.Label>
            <TextInput />
          </Field>
        </Form.Section>

        <Form.Section title={'A map: the window decides'}>
          <Field span={{ base: 6, md: 2 }}>
            <Field.Label>ZIP code</Field.Label>
            <TextInput />
          </Field>
          <Field span={{ base: 6, md: 4 }}>
            <Field.Label>City</Field.Label>
            <TextInput />
          </Field>
        </Form.Section>
      </Form>
    </Stack>
  );
}
