import * as React from 'react';

import { TriangleAlert } from 'lucide-react';

import { BoundField, BoundForm, useSchemaForm } from '@proedis/form';
import { Button } from '@proedis/ui/actions/button';
import { Form } from '@proedis/ui/forms/form';
import { NumberInput } from '@proedis/ui/forms/number-input';
import { TextInput } from '@proedis/ui/forms/text-input';
import { Dialog } from '@proedis/ui/overlays/dialog';

import type { DialogDiscard } from '@proedis/ui/overlays/dialog';
import { EMPTY_VEHICLE, vehicleSchema } from './vehicle';

import type { Vehicle } from './vehicle';


const schema = vehicleSchema.pick({ plate: true, model: true, capacity: true });

const DISCARD: DialogDiscard = {
  title      : 'Discard the new vehicle?',
  description: 'What you wrote is lost.',
  action     : 'Discard',
  cancel     : 'Keep editing',
  icon       : <TriangleAlert />
};

/** A server that takes a second and a half */
function save(): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, 1500);
  });
}


/**
 * The dialog is told nothing about the form: it waits while the form is sent, and asks before closing
 * a form that was changed, because the form reports both. Type something, then press Esc.
 */
export default function Example(): React.ReactNode {
  const [ open, setOpen ] = React.useState(false);
  const form = useSchemaForm(schema, { defaultValues: EMPTY_VEHICLE });

  const handleOpenChange = (next: boolean): void => {
    setOpen(next);

    if (!next) {
      form.reset();
    }
  };

  const handleSubmit = async (vehicle: Pick<Vehicle, 'plate' | 'model' | 'capacity'>): Promise<void> => {
    await save();
    window.console.info('Saved', vehicle);
    handleOpenChange(false);
  };

  return (
    <React.Fragment>
      <Button onClick={() => setOpen(true)}>New vehicle</Button>

      <Dialog
        open={open}
        onOpenChange={handleOpenChange}
        title={'New vehicle'}
        discard={DISCARD}
        footer={(
          <React.Fragment>
            <Form.Cancel>Cancel</Form.Cancel>
            <Form.Submit loadingLabel={'Saving the vehicle'}>Save</Form.Submit>
          </React.Fragment>
        )}
        labels={{ close: 'Close', busySubmit: 'Saving the vehicle' }}
      >
        <BoundForm form={form} onSubmit={handleSubmit}>
          <Form.Section>
            <BoundField name={'plate'} span={2}><TextInput width={'code'} /></BoundField>
            <BoundField name={'model'} span={4}><TextInput /></BoundField>
            <BoundField name={'capacity'} span={3}><NumberInput suffix={'kg'} locale={'en-GB'} /></BoundField>
          </Form.Section>
        </BoundForm>
      </Dialog>
    </React.Fragment>
  );
}
