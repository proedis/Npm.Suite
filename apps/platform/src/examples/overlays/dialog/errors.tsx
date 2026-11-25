import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { Field } from '@proedis/ui/forms/field';
import { Form } from '@proedis/ui/forms/form';
import { TextInput } from '@proedis/ui/forms/text-input';
import { Dialog } from '@proedis/ui/overlays/dialog';


export default function Example(): React.ReactNode {
  const [ open, setOpen ] = React.useState(false);
  const [ saving, setSaving ] = React.useState(false);
  const [ error, setError ] = React.useState<string | null>(null);

  const handleOpenChange = React.useCallback((next: boolean) => {
    setOpen(next);
    setError(null);
    setSaving(false);
  }, []);

  /** A save the server refuses after a second */
  const handleSubmit = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    window.setTimeout(() => {
      setSaving(false);
      setError('The depot refused the change: the vehicle is on a route right now. Try again when it is back.');
    }, 1000);
  }, []);

  /** A save that never answers: after 15 seconds the dialog says so */
  const handleSilentSave = React.useCallback(() => {
    setError(null);
    setSaving(true);
  }, []);

  /*
   * Cancel the request here, and leave `busy` as it is: the dialog shows the timeout for as long as
   * `busy` stays 'submit', and is usable again meanwhile. Setting it back to false would erase the message.
   */
  const handleTimeout = React.useCallback(() => undefined, []);

  return (
    <React.Fragment>
      <Button fill={'soft'} onClick={() => setOpen(true)}>Move the vehicle to another depot</Button>

      <Dialog
        open={open}
        onOpenChange={handleOpenChange}
        title={'Move FT-234-KL'}
        error={error}
        busy={saving ? 'submit' : false}
        onSubmitTimeout={handleTimeout}
        footer={(
          <React.Fragment>
            <Dialog.Cancel>Cancel</Dialog.Cancel>
            <Button fill={'soft'} onClick={handleSilentSave}>Save, no answer</Button>
            <Dialog.Submit loadingLabel={'Saving'}>Save, refused</Dialog.Submit>
          </React.Fragment>
        )}
        labels={{
          close     : 'Close',
          busySubmit: 'Moving the vehicle',
          timeout   : 'The depot did not answer in 15 seconds. The change may not have been saved: check the vehicle before trying again.'
        }}
      >
        <Form onSubmit={handleSubmit}>
          <Field label={'Depot'}>
            <TextInput defaultValue={'South depot, Moncalieri'} />
          </Field>
        </Form>
      </Dialog>
    </React.Fragment>
  );
}
