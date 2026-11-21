import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { TextInput } from '@proedis/ui/forms/text-input';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={5} className={'w-full max-w-sm'}>
      <Field disabled>
        <Field.Label>Contract code</Field.Label>
        <TextInput defaultValue={'CT-2026-0148'} />
        <Field.Description>Assigned by the billing office</Field.Description>
      </Field>

      <Field>
        <Field.Label>Customer</Field.Label>
        <TextInput readOnly defaultValue={'Comune di Chieri'} />
        <Field.Description>Read only: reachable, selectable, and still submitted</Field.Description>
      </Field>
    </Stack>
  );
}
