import * as React from 'react';

import { DurationInput, durationFromTimeSpan, durationToTimeSpan } from '@proedis/ui/forms/duration-input';
import { Field } from '@proedis/ui/forms/field';
import { Stack } from '@proedis/ui/layout';

import labels from './labels';


/** What an API sends: a TimeSpan */
const FROM_THE_API = '01:30:00';


export default function Example(): React.ReactNode {
  const [ seconds, setSeconds ] = React.useState<number | null>(durationFromTimeSpan(FROM_THE_API));

  return (
    <Stack gap={3} className={'w-full max-w-sm'}>
      <Field label={'Duration of the round'} description={'Type the digits: each segment moves to the next once full.'}>
        <DurationInput value={seconds} onValueChange={setSeconds} labels={labels} />
      </Field>
      <p className={'text-sm text-muted-foreground'}>
        Value: <code className={'font-mono text-foreground'}>{JSON.stringify(seconds)}</code> seconds, sent as{' '}
        <code className={'font-mono text-foreground'}>{JSON.stringify(durationToTimeSpan(seconds))}</code>
      </p>
    </Stack>
  );
}
