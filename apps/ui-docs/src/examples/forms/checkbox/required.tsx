import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { Checkbox } from '@proedis/ui/forms/checkbox';
import { Field } from '@proedis/ui/forms/field';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  const [ accepted, setAccepted ] = React.useState(false);
  const [ tried, setTried ] = React.useState(false);

  const handleSubmit = React.useCallback(() => setTried(true), []);

  return (
    <Stack gap={4} align={'start'} className={'w-full max-w-sm'}>
      <Field>
        <Checkbox required checked={accepted} onCheckedChange={setAccepted} name={'terms'}>
          I accept the service conditions
        </Checkbox>
        {tried && !accepted && <Field.Error>Accept the conditions to go on</Field.Error>}
      </Field>
      <Button size={'sm'} onClick={handleSubmit}>Confirm</Button>
    </Stack>
  );
}
