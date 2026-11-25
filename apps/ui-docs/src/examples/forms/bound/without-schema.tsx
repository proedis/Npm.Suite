import * as React from 'react';

import { useForm } from 'react-hook-form';

import { BoundField, BoundForm } from '@proedis/form';
import { Form } from '@proedis/ui/forms/form';
import { NumberInput } from '@proedis/ui/forms/number-input';
import { TextInput } from '@proedis/ui/forms/text-input';

import { Submitted } from './Submitted';


interface Stop {
  address: string;
  bins: number | null;
}


/**
 * No schema: `useForm` with the rules of react-hook-form, and the label and the asterisk written on the
 * field. The binding is the same; only what a schema would have said is the caller's.
 */
export default function Example(): React.ReactNode {
  const form = useForm<Stop>({ defaultValues: { address: '', bins: null } });
  const [ submitted, setSubmitted ] = React.useState<Stop>();

  /* The rules are registered once, before the fields bind */
  form.register('address', { required: 'Write the address' });
  form.register('bins', { min: { value: 1, message: 'At least one bin' } });

  return (
    <BoundForm form={form} onSubmit={setSubmitted} className={'w-full max-w-md'}>
      <Form.Section>
        <BoundField name={'address'} label={'Address of the stop'} required span={4}><TextInput /></BoundField>
        <BoundField name={'bins'} label={'Bins'} span={2}><NumberInput /></BoundField>
      </Form.Section>

      <Form.Footer>
        <Form.Submit loadingLabel={'Adding'}>Add the stop</Form.Submit>
      </Form.Footer>

      <Submitted value={submitted} />
    </BoundForm>
  );
}
