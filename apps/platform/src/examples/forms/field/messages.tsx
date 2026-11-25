import * as React from 'react';

import { SegmentedControl } from '@proedis/ui/actions/segmented-control';
import { Field } from '@proedis/ui/forms/field';
import { TextInput } from '@proedis/ui/forms/text-input';
import { Stack } from '@proedis/ui/layout';

import type { FieldStatus } from '@proedis/ui/forms/field';


type Line = 'hint' | FieldStatus;

const MESSAGES: Readonly<Record<FieldStatus, string>> = {
  error  : 'The plate is not in the registry',
  warning: 'The plate is already on another vehicle',
  success: 'Found in the registry: Iveco Eurocargo'
};


/** The line under the control, four ways: the field under it never moves */
export default function Example(): React.ReactNode {
  const [ line, setLine ] = React.useState<Line>('hint');

  const status = line === 'hint' || line === 'error' ? undefined : line;

  return (
    <Stack gap={'lg'} className={'w-full max-w-sm'}>
      <SegmentedControl aria-label={'The line under the control'} value={line} onValueChange={(next) => setLine(next as Line)} size={'sm'}>
        <SegmentedControl.Item value={'hint'}>Hint</SegmentedControl.Item>
        <SegmentedControl.Item value={'error'}>Error</SegmentedControl.Item>
        <SegmentedControl.Item value={'warning'}>Warning</SegmentedControl.Item>
        <SegmentedControl.Item value={'success'}>Success</SegmentedControl.Item>
      </SegmentedControl>

      <Field
        label={'Plate'}
        description={'As printed on the registration'}
        hint={'Letters and digits, no spaces'}
        error={line === 'error' ? MESSAGES.error : null}
        status={status}
        message={status && MESSAGES[status]}
      >
        <TextInput width={'code'} defaultValue={'FT 234 KL'} />
      </Field>

      <Field label={'Next field'} description={'It stays where it is, whatever the line above says'}>
        <TextInput />
      </Field>
    </Stack>
  );
}
