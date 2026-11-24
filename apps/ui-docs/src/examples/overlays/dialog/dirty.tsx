import * as React from 'react';

import { TriangleAlert } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { Field } from '@proedis/ui/forms/field';
import { Form } from '@proedis/ui/forms/form';
import { Textarea } from '@proedis/ui/forms/textarea';
import { Dialog } from '@proedis/ui/overlays/dialog';

import type { DialogDiscard } from '@proedis/ui/overlays/dialog';


/** The texts of the prompt: the package writes none */
const DISCARD: DialogDiscard = {
  title      : 'Discard the changes?',
  description: 'The note you wrote is lost.',
  action     : 'Discard',
  cancel     : 'Keep editing',
  icon       : <TriangleAlert />
};


export default function Example(): React.ReactNode {
  const [ open, setOpen ] = React.useState(false);
  const [ note, setNote ] = React.useState('');

  const handleOpenChange = React.useCallback((next: boolean) => {
    setOpen(next);

    if (!next) {
      setNote('');
    }
  }, []);

  const handleSubmit = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleOpenChange(false);
  }, [ handleOpenChange ]);

  return (
    <React.Fragment>
      <Button fill={'soft'} onClick={() => setOpen(true)}>Add a note to the order</Button>

      <Dialog
        open={open}
        onOpenChange={handleOpenChange}
        title={'Note for order 2026/1184'}
        dirty={note.trim() !== ''}
        discard={DISCARD}
        footer={(
          <React.Fragment>
            <Dialog.Cancel>Cancel</Dialog.Cancel>
            <Dialog.Submit>Save note</Dialog.Submit>
          </React.Fragment>
        )}
        labels={{ close: 'Close' }}
      >
        <Form onSubmit={handleSubmit}>
          <Field label={'Note'} description={'Type something, then press Esc, the x or Cancel.'}>
            <Textarea value={note} onChange={(event) => setNote(event.currentTarget.value)} />
          </Field>
        </Form>
      </Dialog>
    </React.Fragment>
  );
}
