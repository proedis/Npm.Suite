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
    <Field
      className={'w-full max-w-md'}
      label={'Message for the driver'}
      description={'Shown on the tablet at the stop'}
      counterExceeded={over > 0}
      counter={<React.Fragment>{text.length}/{LIMIT}</React.Fragment>}
      error={over > 0 ? `${over} characters too many` : null}
    >
      <Textarea value={text} onChange={handleChange} />
    </Field>
  );
}
