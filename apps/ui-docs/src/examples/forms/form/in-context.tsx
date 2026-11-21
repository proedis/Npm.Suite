import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { Badge } from '@proedis/ui/display/badge';
import { Field } from '@proedis/ui/forms/field';
import { Form } from '@proedis/ui/forms/form';
import { NumberInput } from '@proedis/ui/forms/number-input';
import { TextInput } from '@proedis/ui/forms/text-input';
import { Textarea } from '@proedis/ui/forms/textarea';


/* --------
 * Types Definition
 * -------- */

interface Vehicle {
  plate: string;
  fleetNumber: number | null;
  model: string;
  vin: string;
  grossWeight: number | null;
  payload: number | null;
  volume: number | null;
  notes: string;
}

type Errors = Partial<Record<keyof Vehicle, string>>;


/* --------
 * Constants Definition
 * -------- */

const EMPTY: Vehicle = {
  plate      : 'AB 123 CD',
  fleetNumber: null,
  model      : '',
  vin        : 'ZCFC70A',
  grossWeight: 26000,
  payload    : 28000,
  volume     : 22.5,
  notes      : ''
};

const PLATE = /^[A-Z]{2} ?\d{3} ?[A-Z]{2}$/i;

const NOTES_LIMIT = 250;

/** The plates the server already knows: its answer arrives after the submit */
const TAKEN = [ 'AB 123 CD' ];


/* --------
 * Helpers
 * -------- */

function validate(vehicle: Vehicle): Errors {
  const errors: Errors = {};

  if (!PLATE.test(vehicle.plate.trim())) {
    errors.plate = 'Two letters, three digits, two letters';
  }

  if (!vehicle.model.trim()) {
    errors.model = 'Write the model';
  }

  if (vehicle.vin.trim().length !== 17) {
    errors.vin = '17 characters';
  }

  if (vehicle.grossWeight === null) {
    errors.grossWeight = 'Required';
  }

  if (vehicle.payload !== null && vehicle.grossWeight !== null && vehicle.payload >= vehicle.grossWeight) {
    errors.payload = 'Below the gross weight';
  }

  if (vehicle.notes.length > NOTES_LIMIT) {
    errors.notes = `${vehicle.notes.length - NOTES_LIMIT} characters too many`;
  }

  return errors;
}


/* --------
 * Component Definition
 * -------- */

export default function Example(): React.ReactNode {

  // ----
  // Internal State
  // ----
  const [ vehicle, setVehicle ] = React.useState<Vehicle>(EMPTY);
  const [ errors, setErrors ] = React.useState<Errors>({});
  const [ saving, setSaving ] = React.useState(false);
  const [ saved, setSaved ] = React.useState(false);


  // ----
  // Handlers
  // ----
  const update = React.useCallback(<K extends keyof Vehicle>(key: K, value: Vehicle[K]) => {
    setVehicle((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }, []);

  const handleSubmit = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const found = validate(vehicle);
    setErrors(found);

    if (Object.keys(found).length) {
      return;
    }

    /* The server answers later: the form waits for its errors and moves the focus when they arrive */
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);

      if (TAKEN.includes(vehicle.plate.trim().toUpperCase())) {
        setErrors({ plate: 'Already in the fleet' });
        return;
      }

      setSaved(true);
    }, 900);
  }, [ vehicle ]);


  // ----
  // Component Render
  // ----
  return (
    <Form onSubmit={handleSubmit} className={'w-full max-w-3xl'}>
      <Form.Header title={'New vehicle'} description={'Added to the fleet of the north depot'} />

      <Form.ErrorSummary title={(count) => (count === 1 ? 'One field to fix' : `${count} fields to fix`)} />

      <Form.Section title={'Vehicle'} description={'How the vehicle is identified on the road and in the yard'}>
        <Field span={2}>
          <Field.Label required>Plate</Field.Label>
          <TextInput width={'code'} value={vehicle.plate} onChange={(event) => update('plate', event.currentTarget.value)} />
          <Field.Description>As on the registration</Field.Description>
          <Field.Error summary={`Plate: ${errors.plate?.toLowerCase() ?? ''}`}>{errors.plate}</Field.Error>
        </Field>
        <Field span={1}>
          <Field.Label optional={'optional'}>Fleet no.</Field.Label>
          <NumberInput max={999} value={vehicle.fleetNumber} onValueChange={(value) => update('fleetNumber', value)} />
        </Field>
        <Field span={3}>
          <Field.Label required>Model</Field.Label>
          <TextInput value={vehicle.model} onChange={(event) => update('model', event.currentTarget.value)} placeholder={'E.g. Iveco Eurocargo 180'} />
          <Field.Error summary={'Model: write it'}>{errors.model}</Field.Error>
        </Field>
        <Field span={4} breakBefore>
          <Field.Label required>Chassis number (VIN)</Field.Label>
          <TextInput width={'long'} value={vehicle.vin} onChange={(event) => update('vin', event.currentTarget.value)} />
          <Field.Description>17 characters, stamped on the frame</Field.Description>
          <Field.Error summary={'Chassis number: it has 17 characters'}>{errors.vin}</Field.Error>
        </Field>
      </Form.Section>

      <Form.Section title={'Capacity'} description={'What the vehicle may carry, from the registration'}>
        <Field span={2}>
          <Field.Label required>Gross weight</Field.Label>
          <NumberInput max={44000} suffix={'kg'} locale={'en-GB'} value={vehicle.grossWeight} onValueChange={(value) => update('grossWeight', value)} />
          <Field.Error summary={'Gross weight: required'}>{errors.grossWeight}</Field.Error>
        </Field>
        <Field span={2}>
          <Field.Label required>Payload</Field.Label>
          <NumberInput max={44000} suffix={'kg'} locale={'en-GB'} value={vehicle.payload} onValueChange={(value) => update('payload', value)} />
          <Field.Error summary={'Payload: it must be below the gross weight'}>{errors.payload}</Field.Error>
        </Field>
        <Field span={2}>
          <Field.Label optional={'optional'}>Body volume</Field.Label>
          <NumberInput max={99} decimals={1} suffix={'m³'} locale={'en-GB'} value={vehicle.volume} onValueChange={(value) => update('volume', value)} />
        </Field>
      </Form.Section>

      <Form.Section title={'Notes'}>
        <Field span={6}>
          <Field.Label optional={'optional'}>For the workshop</Field.Label>
          <Textarea value={vehicle.notes} onChange={(event) => update('notes', event.currentTarget.value)} />
          <Field.Counter exceeded={vehicle.notes.length > NOTES_LIMIT}>{vehicle.notes.length}/{NOTES_LIMIT}</Field.Counter>
          <Field.Error summary={'Notes: too long'}>{errors.notes}</Field.Error>
        </Field>
      </Form.Section>

      <Form.Footer>
        {saved && <Badge fill={'soft'} tone={'success'} dot className={'me-auto'}>Saved</Badge>}
        <Button fill={'plain'} tone={'muted'}>Cancel</Button>
        <Button type={'submit'} loading={saving} loadingLabel={'Saving the vehicle'}>Add vehicle</Button>
      </Form.Footer>
    </Form>
  );

}
