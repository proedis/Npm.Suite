import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { Field } from '@proedis/ui/forms/field';
import { Form } from '@proedis/ui/forms/form';
import { TextInput } from '@proedis/ui/forms/text-input';
import { Dialog } from '@proedis/ui/overlays/dialog';


export default function Example(): React.ReactNode {
  const [ open, setOpen ] = React.useState(false);
  const [ name, setName ] = React.useState('North district, Monday');

  const handleOpen = React.useCallback(() => setOpen(true), []);

  /** The form renders no submit of its own: Dialog.Submit in the footer points at it */
  const handleSubmit = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setName(String(new FormData(event.currentTarget).get('name')));
    setOpen(false);
  }, []);

  return (
    <React.Fragment>
      <Button fill={'soft'} onClick={handleOpen}>Rename “{name}”</Button>

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={'Rename the route'}
        footer={(
          <React.Fragment>
            <Dialog.Cancel>Cancel</Dialog.Cancel>
            <Dialog.Submit>Rename</Dialog.Submit>
          </React.Fragment>
        )}
        labels={{ close: 'Close' }}
      >
        <Form onSubmit={handleSubmit}>
          <Field name={'name'} label={'Name'}>
            <TextInput key={name} name={'name'} defaultValue={name} />
          </Field>
        </Form>
      </Dialog>
    </React.Fragment>
  );
}
