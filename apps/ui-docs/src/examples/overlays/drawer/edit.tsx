import * as React from 'react';

import { Pencil, TriangleAlert } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { Field } from '@proedis/ui/forms/field';
import { Form } from '@proedis/ui/forms/form';
import { TextInput } from '@proedis/ui/forms/text-input';
import { Drawer } from '@proedis/ui/overlays/drawer';

import type { DialogDiscard } from '@proedis/ui/overlays/dialog';
import { VehicleFacts } from './VehicleFacts';
import { VehicleList } from './VehicleList';
import { VEHICLES } from './vehicles';

import type { Vehicle } from './vehicles';


const DISCARD: DialogDiscard = {
  title      : 'Discard the changes?',
  description: 'The vehicle keeps its saved data.',
  action     : 'Discard',
  cancel     : 'Keep editing',
  icon       : <TriangleAlert />
};


export default function Example(): React.ReactNode {
  const [ vehicles, setVehicles ] = React.useState<readonly Vehicle[]>(VEHICLES.slice(0, 3));
  const [ index, setIndex ] = React.useState<number | null>(null);
  const [ mode, setMode ] = React.useState<'detail' | 'form'>('detail');
  const [ dirty, setDirty ] = React.useState(false);
  const [ saving, setSaving ] = React.useState(false);
  const vehicle = index === null ? null : vehicles[index];

  const handleOpenChange = React.useCallback((open: boolean) => {
    if (!open) {
      setIndex(null);
      setMode('detail');
      setDirty(false);
    }
  }, []);

  /** Cancel and Esc in the form come back here, through the discard prompt when something changed */
  const handleBack = React.useCallback(() => {
    setMode('detail');
    setDirty(false);
  }, []);

  const handleSubmit = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const driver = String(new FormData(event.currentTarget).get('driver'));

    setSaving(true);

    window.setTimeout(() => {
      setVehicles((current) => current.map((item, position) => (position === index ? { ...item, driver } : item)));
      setSaving(false);
      setDirty(false);
      setMode('detail');
    }, 1000);
  }, [ index ]);

  return (
    <React.Fragment>
      <VehicleList vehicles={vehicles} onOpen={setIndex} />

      <Drawer
        open={vehicle !== null}
        onOpenChange={handleOpenChange}
        mode={mode}
        title={vehicle?.plate}
        description={vehicle?.status}
        onBack={handleBack}
        dirty={dirty}
        discard={DISCARD}
        busy={saving ? 'submit' : false}
        footer={mode === 'detail'
          ? <Button fill={'soft'} leading={<Pencil />} onClick={() => setMode('form')}>Edit vehicle</Button>
          : (
            <React.Fragment>
              <Drawer.Cancel>Cancel</Drawer.Cancel>
              <Drawer.Submit>Save</Drawer.Submit>
            </React.Fragment>
          )}
        labels={{ close: 'Close', busySubmit: 'Saving the vehicle' }}
      >
        {vehicle && mode === 'detail' && <VehicleFacts vehicle={vehicle} />}
        {vehicle && mode === 'form' && (
          <Form onSubmit={handleSubmit} onChange={() => setDirty(true)}>
            <Field>
              <Field.Label>Driver</Field.Label>
              <TextInput name={'driver'} defaultValue={vehicle.driver} />
            </Field>
            <Field>
              <Field.Label>Depot</Field.Label>
              <TextInput name={'depot'} defaultValue={vehicle.depot} />
            </Field>
          </Form>
        )}
      </Drawer>
    </React.Fragment>
  );
}
