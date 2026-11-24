import * as React from 'react';

import { Plus, TriangleAlert } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { Checkbox } from '@proedis/ui/forms/checkbox';
import { Field } from '@proedis/ui/forms/field';
import { Form } from '@proedis/ui/forms/form';
import { TextInput } from '@proedis/ui/forms/text-input';
import { Dialog } from '@proedis/ui/overlays/dialog';

import type { DialogDiscard, DialogLabels } from '@proedis/ui/overlays/dialog';


/* --------
 * Texts
 * -------- */

/** Every text the dialog shows comes from the application, normally through its translations */
const LABELS: DialogLabels = {
  close     : 'Close',
  busySubmit: 'Creating the vehicle',
  timeout   : 'The server did not answer in 15 seconds. Check the fleet before trying again.'
};

const DISCARD: DialogDiscard = {
  title      : 'Discard the new vehicle?',
  description: 'What you typed is lost.',
  action     : 'Discard',
  cancel     : 'Keep editing',
  icon       : <TriangleAlert />
};


/* --------
 * Example
 * -------- */

export default function Example(): React.ReactNode {
  const [ open, setOpen ] = React.useState(false);
  const [ dirty, setDirty ] = React.useState(false);
  const [ saving, setSaving ] = React.useState(false);
  const [ another, setAnother ] = React.useState(false);
  const [ created, setCreated ] = React.useState<readonly string[]>([]);
  const formRef = React.useRef<HTMLFormElement>(null);

  const handleOpenChange = React.useCallback((next: boolean) => {
    setOpen(next);
    setDirty(false);
  }, []);

  const handleSubmit = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const plate = String(new FormData(event.currentTarget).get('plate') || 'New vehicle');

    setSaving(true);

    window.setTimeout(() => {
      setSaving(false);
      setCreated((current) => [ ...current, plate ]);
      setDirty(false);

      /*
       * "Create another" keeps the dialog open on an empty form, focused on its first field: on the next
       * frame, once the dialog is no longer inert
       */
      if (another) {
        formRef.current?.reset();
        window.requestAnimationFrame(() => formRef.current?.querySelector('input')?.focus());
        return;
      }

      setOpen(false);
    }, 1200);
  }, [ another ]);

  return (
    <React.Fragment>
      <Button leading={<Plus />} onClick={() => setOpen(true)}>New vehicle</Button>
      {created.length > 0 && <p className={'text-sm text-muted-foreground'}>Created: {created.join(', ')}</p>}

      <Dialog
        open={open}
        onOpenChange={handleOpenChange}
        icon={<Plus />}
        iconTone={'primary'}
        title={'New vehicle'}
        description={'Available on the routes from tomorrow.'}
        dirty={dirty}
        discard={DISCARD}
        busy={saving ? 'submit' : false}
        footerStart={<Checkbox checked={another} onCheckedChange={setAnother}>Create another</Checkbox>}
        footer={(
          <React.Fragment>
            <Dialog.Cancel>Cancel</Dialog.Cancel>
            <Dialog.Submit>Create vehicle</Dialog.Submit>
          </React.Fragment>
        )}
        labels={LABELS}
      >
        <Form ref={formRef} onSubmit={handleSubmit} onChange={() => setDirty(true)}>
          <Form.Section>
            <Field span={3} label={'Plate'}>
              <TextInput name={'plate'} placeholder={'FT-234-KL'} />
            </Field>
            <Field span={3} label={'Model'}>
              <TextInput name={'model'} />
            </Field>
            <Field span={2} label={'Capacity'}>
              <TextInput name={'capacity'} inputMode={'numeric'} suffix={'m³'} />
            </Field>
            <Field span={4} label={'Depot'}>
              <TextInput name={'depot'} defaultValue={'North depot, Chieri'} />
            </Field>
          </Form.Section>
        </Form>
      </Dialog>
    </React.Fragment>
  );
}
