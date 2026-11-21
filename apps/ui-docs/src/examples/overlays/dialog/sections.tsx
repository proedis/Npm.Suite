import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { Field } from '@proedis/ui/forms/field';
import { Form } from '@proedis/ui/forms/form';
import { TextInput } from '@proedis/ui/forms/text-input';
import { Dialog } from '@proedis/ui/overlays/dialog';

import type { DialogSection } from '@proedis/ui/overlays/dialog';


/** From three to five, with `lg` only. `errors` puts a count beside the item */
const SECTIONS: readonly DialogSection[] = [
  { id: 'identity', label: 'Identity' },
  { id: 'address', label: 'Address', errors: 2 },
  { id: 'billing', label: 'Billing' },
  { id: 'contacts', label: 'Contacts' }
];


export default function Example(): React.ReactNode {
  const [ open, setOpen ] = React.useState(false);

  const handleSubmit = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOpen(false);
  }, []);

  return (
    <React.Fragment>
      <Button fill={'soft'} onClick={() => setOpen(true)}>Edit the customer record</Button>

      <Dialog
        open={open}
        onOpenChange={setOpen}
        size={'lg'}
        title={'Comune di Chieri'}
        sections={SECTIONS}
        footer={(
          <React.Fragment>
            <Dialog.Cancel>Cancel</Dialog.Cancel>
            <Dialog.Submit>Save</Dialog.Submit>
          </React.Fragment>
        )}
        labels={{ close: 'Close', sections: 'Sections of the record', sectionErrors: (count) => `${count} errors` }}
        className={'max-h-140'}
      >
        <Form onSubmit={handleSubmit}>
          <Dialog.Section id={'identity'} title={'Identity'}>
            <Field><Field.Label>Name</Field.Label><TextInput defaultValue={'Comune di Chieri'} /></Field>
            <Field><Field.Label>Tax code</Field.Label><TextInput defaultValue={'90003840017'} /></Field>
          </Dialog.Section>
          <Dialog.Section id={'address'} title={'Address'}>
            <Field>
              <Field.Label>Street</Field.Label>
              <TextInput invalid />
              <Field.Error>The street is required.</Field.Error>
            </Field>
            <Field>
              <Field.Label>Postcode</Field.Label>
              <TextInput invalid />
              <Field.Error>The postcode is required.</Field.Error>
            </Field>
          </Dialog.Section>
          <Dialog.Section id={'billing'} title={'Billing'}>
            <Field><Field.Label>IBAN</Field.Label><TextInput /></Field>
            <Field><Field.Label>Recipient code</Field.Label><TextInput /></Field>
          </Dialog.Section>
          <Dialog.Section id={'contacts'} title={'Contacts'}>
            <Field><Field.Label>Email</Field.Label><TextInput type={'email'} /></Field>
            <Field><Field.Label>Phone</Field.Label><TextInput type={'tel'} /></Field>
          </Dialog.Section>
        </Form>
      </Dialog>
    </React.Fragment>
  );
}
