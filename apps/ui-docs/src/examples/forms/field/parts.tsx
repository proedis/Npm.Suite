import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { Textarea } from '@proedis/ui/forms/textarea';


export default function Example(): React.ReactNode {
  const [ notes, setNotes ] = React.useState('Wet material, weigh twice');

  const handleChange = React.useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(event.currentTarget.value);
  }, []);

  return (
    <Field className={'w-full max-w-md'}>
      <Field.Label required>Notes for the driver</Field.Label>
      <Textarea value={notes} onChange={handleChange} />
      <Field.Description>Read on the tablet at the stop</Field.Description>
      <Field.Counter exceeded={notes.length > 120}>{notes.length}/120</Field.Counter>
    </Field>
  );
}
