import * as React from 'react';

import { DatePicker } from '@proedis/ui/forms/date-picker';
import { Field } from '@proedis/ui/forms/field';
import { Stack } from '@proedis/ui/layout';

import type { DateRange } from '@proedis/ui/forms/date-picker';
import labels from './labels';


export default function Example(): React.ReactNode {
  const [ period, setPeriod ] = React.useState<DateRange>({ from: '2026-11-09', to: '2026-11-22' });

  return (
    <Stack gap={3} className={'w-full max-w-sm'}>
      <Field>
        <Field.Label>Period of the report</Field.Label>
        <DatePicker mode={'range'} locale={'en-GB'} value={period} onValueChange={setPeriod} labels={labels} />
        <Field.Description>One field, both dates: type them one after the other without stopping.</Field.Description>
      </Field>
      <p className={'text-sm text-muted-foreground'}>
        Value: <code className={'font-mono text-foreground'}>{JSON.stringify(period)}</code>
      </p>
    </Stack>
  );
}
