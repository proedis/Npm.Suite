import * as React from 'react';

import { Checkbox, CheckboxGroup } from '@proedis/ui/forms/checkbox';
import { Field } from '@proedis/ui/forms/field';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  const [ days, setDays ] = React.useState<string[]>([ 'mon', 'thu' ]);

  return (
    <Stack gap={3}>
      <Field>
        <Field.Label required>Collection days</Field.Label>
        <CheckboxGroup value={days} onValueChange={setDays}>
          <Checkbox parent>Every working day</Checkbox>
          <Checkbox value={'mon'}>Monday</Checkbox>
          <Checkbox value={'tue'}>Tuesday</Checkbox>
          <Checkbox value={'wed'}>Wednesday</Checkbox>
          <Checkbox value={'thu'}>Thursday</Checkbox>
          <Checkbox value={'fri'}>Friday</Checkbox>
        </CheckboxGroup>
        <Field.Description>The parent box follows the days, and checks or clears them all.</Field.Description>
      </Field>
      <p className={'text-sm text-muted-foreground'}>
        Value: <code className={'font-mono text-foreground'}>{JSON.stringify(days)}</code>
      </p>
    </Stack>
  );
}
