import * as React from 'react';

import { Hash } from 'lucide-react';

import { BoundField, BoundForm, useSchemaForm } from '@proedis/form';
import { Form } from '@proedis/ui/forms/form';
import { TextInput } from '@proedis/ui/forms/text-input';
import { Textarea } from '@proedis/ui/forms/textarea';

import { EMPTY_VEHICLE, vehicleSchema } from './vehicle';


const schema = vehicleSchema.pick({ plate: true, notes: true });

/** The labels in the language of the page: what `.describe()` says is the fallback, never the last word */
const TEXTS = {
  plate: 'Targa',
  notes: 'Note per l’autista'
};


/**
 * A prop of the field wins over the schema, and a prop of the control wins over the binding: the
 * label translated, an icon, a hint, a counter of your own. The schema keeps the rules.
 */
export default function Example(): React.ReactNode {
  const form = useSchemaForm(schema, { defaultValues: EMPTY_VEHICLE });

  return (
    <BoundForm form={form} onSubmit={() => undefined} className={'w-full max-w-md'}>
      <Form.Section>
        <BoundField name={'plate'} label={TEXTS.plate} icon={<Hash />} description={'Come sul libretto'} span={3}>
          <TextInput width={'code'} placeholder={'AB 123 CD'} />
        </BoundField>
        <BoundField name={'notes'} label={TEXTS.notes} hint={'Lette in piedi, alla fermata'} span={6}>
          <Textarea rows={2} />
        </BoundField>
      </Form.Section>
    </BoundForm>
  );
}
