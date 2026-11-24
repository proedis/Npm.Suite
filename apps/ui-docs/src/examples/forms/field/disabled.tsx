import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { TextInput } from '@proedis/ui/forms/text-input';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={5} className={'w-full max-w-sm'}>
      <Field disabled label={'Contract code'} description={'Assigned by the billing office'}>
        <TextInput defaultValue={'CT-2026-0148'} />
      </Field>

      <Field label={'Customer'} description={'Read only: reachable, selectable, and still submitted'}>
        <TextInput readOnly defaultValue={'Comune di Chieri'} />
      </Field>
    </Stack>
  );
}
