import * as React from 'react';

import { BoundField, BoundForm, useSchemaForm } from '@proedis/form';
import { Alert } from '@proedis/ui/feedback/alert';
import { Form } from '@proedis/ui/forms/form';
import { TextInput } from '@proedis/ui/forms/text-input';

import { EMPTY_VEHICLE, vehicleSchema } from './vehicle';

import type { Vehicle } from './vehicle';


const schema = vehicleSchema.pick({ plate: true, model: true });

type Plate = Pick<Vehicle, 'plate' | 'model'>;

/** The answer of a server, as an API returns it: a 422 with an error per field, or a failure of its own */
class ApiError extends Error {
  public constructor(public readonly status: number, message: string, public readonly errors?: Readonly<Record<string, string>>) {
    super(message);
  }
}

function register(vehicle: Plate): Promise<void> {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (vehicle.plate.toUpperCase().startsWith('XX')) {
        reject(new ApiError(422, 'Invalid', { plate: 'This plate is already on another vehicle' }));
      }
      else if (vehicle.model.toLowerCase() === 'test') {
        reject(new ApiError(409, 'The registry is being updated: try again in a minute'));
      }
      else {
        resolve();
      }
    }, 800);
  });
}


/**
 * The errors of the server go where the errors of the schema go: on the field, through `setError`, so
 * the summary and the focus follow. Try the plate "XX 123", then the model "test".
 */
export default function Example(): React.ReactNode {
  const form = useSchemaForm(schema, { defaultValues: EMPTY_VEHICLE });
  const [ saved, setSaved ] = React.useState(false);

  const handleSubmit = async (vehicle: Plate): Promise<void> => {
    setSaved(false);

    try {
      await register(vehicle);
      setSaved(true);
    }
    catch (error) {
      if (!(error instanceof ApiError)) {
        throw error;
      }

      if (error.status === 422 && error.errors) {
        for (const [ name, message ] of Object.entries(error.errors)) {
          form.setError(name as keyof Plate, { type: 'server', message });
        }
        return;
      }

      form.setError('root', { type: 'server', message: error.message });
    }
  };

  const rootError = form.formState.errors.root?.message;

  return (
    <BoundForm form={form} onSubmit={handleSubmit} className={'w-full max-w-lg'}>
      {rootError && <Alert live tone={'destructive'} toneLabel={'Error'} title={'Not registered'}>{rootError}</Alert>}
      {saved && <Alert tone={'success'} title={'Vehicle registered'}>It is in the registry from now.</Alert>}

      <Form.Section>
        <BoundField name={'plate'} span={2}><TextInput width={'code'} /></BoundField>
        <BoundField name={'model'} span={4}><TextInput /></BoundField>
      </Form.Section>

      <Form.Footer>
        <Form.Submit loadingLabel={'Registering'}>Register</Form.Submit>
      </Form.Footer>
    </BoundForm>
  );
}
