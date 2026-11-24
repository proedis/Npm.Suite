import * as React from 'react';

import { NotebookPen } from 'lucide-react';

import { Field } from '@proedis/ui/forms/field';
import { Textarea } from '@proedis/ui/forms/textarea';


/** Every prop of a field at once: the label with its glyph and description above, the hint and the count below */
export default function Example(): React.ReactNode {
  const [ notes, setNotes ] = React.useState('Wet material, weigh twice');

  const handleChange = React.useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(event.currentTarget.value);
  }, []);

  return (
    <Field
      className={'w-full max-w-md'}
      icon={<NotebookPen />}
      label={'Notes for the driver'}
      description={'Read on the tablet at the stop'}
      hint={'Short sentences: the driver reads them standing'}
      required
      counter={`${notes.length} / 120`}
      counterExceeded={notes.length > 120}
    >
      <Textarea value={notes} onChange={handleChange} />
    </Field>
  );
}
