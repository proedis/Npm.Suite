import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { Textarea } from '@proedis/ui/forms/textarea';


const LIMIT = 140;


export default function Example(): React.ReactNode {
  const [ text, setText ] = React.useState('The gate is closed after 18:00: ask the porter for the key, and leave it at the reception before the round ends.');

  const handleChange = React.useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.currentTarget.value);
  }, []);

  const over = text.length - LIMIT;

  return (
    <Field className={'w-full max-w-md'}>
      <Field.Label>Message for the driver</Field.Label>
      <Textarea value={text} onChange={handleChange} />
      <Field.Description>Shown on the tablet at the stop</Field.Description>
      <Field.Counter exceeded={over > 0}>{text.length}/{LIMIT}</Field.Counter>
      <Field.Error>{over > 0 ? `${over} characters too many` : null}</Field.Error>
    </Field>
  );
}
