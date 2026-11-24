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
            <Field label={'Name'}><TextInput defaultValue={'Comune di Chieri'} /></Field>
            <Field label={'Tax code'}><TextInput defaultValue={'90003840017'} /></Field>
          </Dialog.Section>
          <Dialog.Section id={'address'} title={'Address'}>
            <Field label={'Street'} error={'The street is required.'}>
              <TextInput invalid />
            </Field>
            <Field label={'Postcode'} error={'The postcode is required.'}>
              <TextInput invalid />
            </Field>
          </Dialog.Section>
          <Dialog.Section id={'billing'} title={'Billing'}>
            <Field label={'IBAN'}><TextInput /></Field>
            <Field label={'Recipient code'}><TextInput /></Field>
          </Dialog.Section>
          <Dialog.Section id={'contacts'} title={'Contacts'}>
            <Field label={'Email'}><TextInput type={'email'} /></Field>
            <Field label={'Phone'}><TextInput type={'tel'} /></Field>
          </Dialog.Section>
        </Form>
      </Dialog>
    </React.Fragment>
  );
}
