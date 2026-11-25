import * as React from 'react';

import { BoundField, BoundForm, useSchemaForm } from '@proedis/form';
import { Form } from '@proedis/ui/forms/form';
import { NumberInput } from '@proedis/ui/forms/number-input';
import { TextInput } from '@proedis/ui/forms/text-input';

import { Submitted } from './Submitted';
import { EMPTY_VEHICLE, vehicleSchema } from './vehicle';

import type { Vehicle } from './vehicle';


/** A name per field: the schema gives the label, the asterisk, the counter and the bounds */
export default function Example(): React.ReactNode {
  const form = useSchemaForm(vehicleSchema.pick({ plate: true, model: true, capacity: true }), { defaultValues: EMPTY_VEHICLE });
  const [ submitted, setSubmitted ] = React.useState<Partial<Vehicle>>();

  return (
    <BoundForm form={form} onSubmit={setSubmitted} className={'w-full max-w-lg'}>
      <Form.Section>
        <BoundField name={'plate'} span={2}>
          <TextInput width={'code'} />
        </BoundField>
        <BoundField name={'model'} span={4}>
          <TextInput />
        </BoundField>
        <BoundField name={'capacity'} span={3} hint={'The legal payload, not the tare'}>
          <NumberInput suffix={'kg'} locale={'en-GB'} />
        </BoundField>
      </Form.Section>

      <Form.Footer>
        <Form.Cancel>Reset</Form.Cancel>
        <Form.Submit loadingLabel={'Saving'}>Save</Form.Submit>
      </Form.Footer>

      <Submitted value={submitted} />
    </BoundForm>
  );
}
