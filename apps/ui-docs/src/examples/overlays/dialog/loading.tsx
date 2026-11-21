import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { Field } from '@proedis/ui/forms/field';
import { Form } from '@proedis/ui/forms/form';
import { TextInput } from '@proedis/ui/forms/text-input';
import { Dialog } from '@proedis/ui/overlays/dialog';


interface Customer {
  readonly name: string;
  readonly vat: string;
}


export default function Example(): React.ReactNode {
  const [ open, setOpen ] = React.useState(false);
  const [ customer, setCustomer ] = React.useState<Customer | null>(null);

  /** The data arrive a second and a half after the dialog opened */
  React.useEffect(() => {
    if (!open) {
      return undefined;
    }

    const timer = window.setTimeout(() => setCustomer({ name: 'Comune di Chieri', vat: 'IT01234560019' }), 1500);
    return () => window.clearTimeout(timer);
  }, [ open ]);

  const handleOpen = React.useCallback(() => {
    setCustomer(null);
    setOpen(true);
  }, []);

  const handleSubmit = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOpen(false);
  }, []);

  return (
    <React.Fragment>
      <Button fill={'soft'} onClick={handleOpen}>Edit the customer</Button>

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={'Edit customer'}
        busy={customer ? false : 'load'}
        footer={(
          <React.Fragment>
            <Dialog.Cancel>Cancel</Dialog.Cancel>
            <Dialog.Submit>Save</Dialog.Submit>
          </React.Fragment>
        )}
        labels={{ close: 'Close', busyLoad: 'Loading the customer' }}
      >
        <Form onSubmit={handleSubmit}>
          <Field>
            <Field.Label>Name</Field.Label>
            <TextInput key={customer?.name} defaultValue={customer?.name} />
          </Field>
          <Field>
            <Field.Label>VAT number</Field.Label>
            <TextInput key={customer?.vat} defaultValue={customer?.vat} />
          </Field>
        </Form>
      </Dialog>
    </React.Fragment>
  );
}
