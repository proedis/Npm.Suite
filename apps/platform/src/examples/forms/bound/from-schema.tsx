import * as React from 'react';

import { BoundField, BoundForm, useSchemaForm } from '@proedis/form';
import { DatePicker } from '@proedis/ui/forms/date-picker';
import { Form } from '@proedis/ui/forms/form';
import { NumberInput } from '@proedis/ui/forms/number-input';
import { Select } from '@proedis/ui/forms/select';
import { Textarea } from '@proedis/ui/forms/textarea';
import { TextInput } from '@proedis/ui/forms/text-input';

import dateLabels from '../date-picker/labels';
import selectLabels from '../select/labels';
import { DEPOTS } from '../select/options';
import { Submitted } from './Submitted';
import { EMPTY_VEHICLE, vehicleSchema } from './vehicle';

import type { Vehicle } from './vehicle';


/**
 * The whole vehicle: not one label, asterisk, counter or bound is written below. Submit it empty for
 * the summary, then fill it: the notes and the axles left empty arrive as `null`.
 */
export default function Example(): React.ReactNode {
  const form = useSchemaForm(vehicleSchema, { defaultValues: EMPTY_VEHICLE });
  const [ submitted, setSubmitted ] = React.useState<Vehicle>();

  return (
    <BoundForm form={form} onSubmit={setSubmitted} className={'w-full max-w-2xl'}>
      <Form.ErrorSummary title={(count) => `${count} fields to fix`} />

      <Form.Section title={'Identity'} description={'How the vehicle is recognised on the road'}>
        <BoundField name={'plate'} span={2}><TextInput width={'code'} /></BoundField>
        <BoundField name={'model'} span={4}><TextInput /></BoundField>
        <BoundField name={'axles'} span={2}><NumberInput /></BoundField>
        <BoundField name={'capacity'} span={2}><NumberInput suffix={'kg'} locale={'en-GB'} /></BoundField>
      </Form.Section>

      <Form.Section title={'Service'} description={'Where it works from, and since when'}>
        <BoundField name={'depot'} span={3}><Select options={DEPOTS} placeholder={'Select'} labels={selectLabels} /></BoundField>
        <BoundField name={'inService'} span={3}><DatePicker locale={'en-GB'} labels={dateLabels} /></BoundField>
        <BoundField name={'notes'} span={6}><Textarea /></BoundField>
      </Form.Section>

      <Form.Footer>
        <Form.Cancel>Reset</Form.Cancel>
        <Form.Submit loadingLabel={'Saving'}>Save the vehicle</Form.Submit>
      </Form.Footer>

      <Submitted value={submitted} />
    </BoundForm>
  );
}
