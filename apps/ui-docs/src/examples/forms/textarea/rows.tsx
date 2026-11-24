import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { Textarea } from '@proedis/ui/forms/textarea';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack columns={{ base: 1, sm: 2 }} gap={5} className={'w-full max-w-2xl'}>
      <Field label={'Two lines to start'}>
        <Textarea rows={2} maxRows={4} placeholder={'Drag the handle: it stops at four lines'} />
      </Field>
      <Field label={'Six lines to start'}>
        <Textarea rows={6} placeholder={'Up to twelve lines, the default'} />
      </Field>
    </Stack>
  );
}
