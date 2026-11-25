import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { Field } from '@proedis/ui/forms/field';
import { Form } from '@proedis/ui/forms/form';
import { TextInput } from '@proedis/ui/forms/text-input';
import { Dialog } from '@proedis/ui/overlays/dialog';


export default function Example(): React.ReactNode {
  const [ open, setOpen ] = React.useState(false);
  const [ saving, setSaving ] = React.useState(false);

  /** Stands in for the request: two seconds, then the dialog closes */
  const handleSubmit = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);

    window.setTimeout(() => {
      setSaving(false);
      setOpen(false);
    }, 2000);
  }, []);

  return (
    <React.Fragment>
      <Button fill={'soft'} onClick={() => setOpen(true)}>Change the driver</Button>

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={'Driver of vehicle FT-234-KL'}
        busy={saving ? 'submit' : false}
        footer={(
          <React.Fragment>
            <Dialog.Cancel>Cancel</Dialog.Cancel>
            <Dialog.Submit loadingLabel={'Saving'}>Save</Dialog.Submit>
          </React.Fragment>
        )}
        labels={{ close: 'Close', busySubmit: 'Saving the driver' }}
      >
        <Form onSubmit={handleSubmit}>
          <Field label={'Driver'} description={'Save, then try Esc or the x while it saves: nothing closes.'}>
            <TextInput defaultValue={'Luca Ferrero'} />
          </Field>
        </Form>
      </Dialog>
    </React.Fragment>
  );
}
