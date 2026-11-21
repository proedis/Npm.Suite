import * as React from 'react';

import { DatePicker } from '@proedis/ui/forms/date-picker';
import { Field } from '@proedis/ui/forms/field';
import { Stack } from '@proedis/ui/layout';

import labels from './labels';


export default function Example(): React.ReactNode {
  const [ date, setDate ] = React.useState<string | null>(null);

  return (
    <Stack gap={3} className={'w-full max-w-xs'}>
      <Field>
        <Field.Label>Collection date</Field.Label>
        <DatePicker locale={'en-GB'} value={date} onValueChange={setDate} labels={labels} />
        <Field.Description>Type it, the slashes arrive on their own, or open the calendar.</Field.Description>
      </Field>
      <p className={'text-sm text-muted-foreground'}>
        Value: <code className={'font-mono text-foreground'}>{JSON.stringify(date)}</code>
      </p>
    </Stack>
  );
}
