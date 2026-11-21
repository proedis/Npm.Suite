import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { Radio, RadioGroup } from '@proedis/ui/forms/radio';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  const [ priority, setPriority ] = React.useState('normal');

  return (
    <Stack gap={3}>
      <Field>
        <Field.Label>Priority of the report</Field.Label>
        <RadioGroup value={priority} onValueChange={setPriority} orientation={'horizontal'}>
          <Radio value={'low'}>Low</Radio>
          <Radio value={'normal'}>Normal</Radio>
          <Radio value={'urgent'}>Urgent</Radio>
        </RadioGroup>
      </Field>
      <p className={'text-sm text-muted-foreground'}>
        Value: <code className={'font-mono text-foreground'}>{JSON.stringify(priority)}</code>
      </p>
    </Stack>
  );
}
