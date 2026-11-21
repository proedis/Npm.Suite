import * as React from 'react';

import { DatePicker } from '@proedis/ui/forms/date-picker';
import { Field } from '@proedis/ui/forms/field';
import { Stack } from '@proedis/ui/layout';

import type { DateRange } from '@proedis/ui/forms/date-picker';
import labels from './labels';


export default function Example(): React.ReactNode {
  const [ period, setPeriod ] = React.useState<DateRange>({ from: '2026-11-01', to: null });

  return (
    <Stack gap={3} className={'w-full max-w-sm'}>
      <Field>
        <Field.Label>Collected since</Field.Label>
        <DatePicker mode={'range'} allowOpenRange size={'sm'} locale={'en-GB'} value={period} onValueChange={setPeriod} labels={labels} />
        <Field.Description>A filter: either end may stay empty.</Field.Description>
      </Field>
      <p className={'text-sm text-muted-foreground'}>
        Value: <code className={'font-mono text-foreground'}>{JSON.stringify(period)}</code>
      </p>
    </Stack>
  );
}
