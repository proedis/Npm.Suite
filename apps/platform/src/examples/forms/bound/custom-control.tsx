import * as React from 'react';

import { Clock } from 'lucide-react';
import { z } from 'zod';

import { BoundField, BoundForm, useSchemaForm } from '@proedis/form';
import { bindable } from '@proedis/ui';
import { FieldShell } from '@proedis/ui/forms/field-shell';
import { Form } from '@proedis/ui/forms/form';

import { Submitted } from './Submitted';


/** The value props are optional, as on every control of the package: the binding hands them over */
interface TimeInputProps {
  value?: string;
  onValueChange?: (value: string) => void;
  onBlur?: () => void;
  ref?: React.Ref<HTMLInputElement>;
}

/**
 * A control of the application: a native time input in the frame of the package. `bindable` declares
 * how it binds, once, next to the control: from then on a BoundField takes it like any other.
 */
const TimeInput = bindable(
  (props: TimeInputProps): React.ReactNode => (
    <FieldShell data-slot={'time-input'} leading={<Clock />} className={'max-w-40'}>
      <input
        ref={props.ref}
        type={'time'}
        value={props.value ?? ''}
        onChange={(event) => props.onValueChange?.(event.currentTarget.value)}
        onBlur={props.onBlur}
        data-field-control={''}
        className={'h-full min-w-0 flex-1 bg-transparent outline-none'}
      />
    </FieldShell>
  ),
  {
    kind: 'text',
    bind: (field) => ({
      ref          : field.ref,
      value        : field.value ?? '',
      onValueChange: field.onChange,
      onBlur       : field.onBlur
    })
  }
);

const shiftSchema = z.object({
  opens : z.string().regex(/^\d{2}:\d{2}$/, 'Choose the time').describe('Opens at'),
  closes: z.string().regex(/^\d{2}:\d{2}$/, 'Choose the time').describe('Closes at')
}).refine((shift) => shift.closes > shift.opens, { path: [ 'closes' ], message: 'After the opening' });


export default function Example(): React.ReactNode {
  const form = useSchemaForm(shiftSchema, { defaultValues: { opens: '06:00', closes: '' } });
  const [ submitted, setSubmitted ] = React.useState<z.output<typeof shiftSchema>>();

  return (
    <BoundForm form={form} onSubmit={setSubmitted} className={'w-full max-w-md'}>
      <Form.Section>
        <BoundField name={'opens'}><TimeInput /></BoundField>
        <BoundField name={'closes'}><TimeInput /></BoundField>
      </Form.Section>

      <Form.Footer>
        <Form.Submit loadingLabel={'Saving'}>Save the shift</Form.Submit>
      </Form.Footer>

      <Submitted value={submitted} />
    </BoundForm>
  );
}
