import * as React from 'react';

import { z } from 'zod';

import { BoundField, BoundForm, useSchemaForm } from '@proedis/form';
import { SegmentedControl } from '@proedis/ui/actions/segmented-control';
import { Checkbox, CheckboxGroup } from '@proedis/ui/forms/checkbox';
import { DatePicker } from '@proedis/ui/forms/date-picker';
import { Form } from '@proedis/ui/forms/form';
import { MultiSelect } from '@proedis/ui/forms/multi-select';
import { NumberInput } from '@proedis/ui/forms/number-input';
import { PasswordInput } from '@proedis/ui/forms/password-input';
import { Radio, RadioGroup } from '@proedis/ui/forms/radio';
import { Select } from '@proedis/ui/forms/select';
import { Switch } from '@proedis/ui/forms/switch';
import { Textarea } from '@proedis/ui/forms/textarea';
import { TextInput } from '@proedis/ui/forms/text-input';

import dateLabels from '../date-picker/labels';
import multiLabels from '../multi-select/labels';
import { WASTE } from '../multi-select/options';
import selectLabels from '../select/labels';
import { DEPOTS } from '../select/options';
import { Submitted } from './Submitted';


const roundSchema = z.object({
  name     : z.string().min(1, 'Name the round').describe('Name'),
  code     : z.string().min(4, 'At least 4 characters').describe('Access code'),
  stops    : z.number({ error: 'How many stops' }).int().min(1).max(200)
    .describe('Stops'),
  notes    : z.string().max(200, 'At most 200 characters').describe('Notes for the crew'),
  depot    : z.string({ error: 'Choose a depot' }).describe('Depot'),
  waste    : z.array(z.string()).min(1, 'At least one kind').describe('Waste collected'),
  starts   : z.string({ error: 'Choose a date' }).describe('Starts on'),
  frequency: z.enum([ 'weekly', 'fortnightly', 'monthly' ]).describe('Frequency'),
  days     : z.array(z.string()).min(1, 'At least one day').describe('Days'),
  view     : z.enum([ 'list', 'map' ]).describe('Opens as'),
  notify   : z.boolean().describe('Notifications'),
  terms    : z.literal(true, { error: 'Accept the terms to go on' }).describe('Terms')
});


/** Every control of the package bound by name: each one declares how, the field does the rest */
export default function Example(): React.ReactNode {
  const form = useSchemaForm(roundSchema, {
    defaultValues: { name: '', code: '', notes: '', waste: [], frequency: 'weekly', days: [], view: 'list', notify: true }
  });
  const [ submitted, setSubmitted ] = React.useState<z.output<typeof roundSchema>>();

  return (
    <BoundForm form={form} onSubmit={setSubmitted} className={'w-full max-w-2xl'}>
      <Form.Section title={'Text and numbers'}>
        <BoundField name={'name'}><TextInput /></BoundField>
        <BoundField name={'code'}><PasswordInput autoComplete={'new-password'} labels={{ show: 'Show the code', hide: 'Hide the code' }} /></BoundField>
        <BoundField name={'stops'} span={2}><NumberInput /></BoundField>
        <BoundField name={'notes'} span={6}><Textarea /></BoundField>
      </Form.Section>

      <Form.Section title={'Lists and dates'}>
        <BoundField name={'depot'}><Select options={DEPOTS} placeholder={'Select'} labels={selectLabels} /></BoundField>
        <BoundField name={'waste'}><MultiSelect options={WASTE} placeholder={'Select'} labels={multiLabels} /></BoundField>
        <BoundField name={'starts'}><DatePicker locale={'en-GB'} labels={dateLabels} /></BoundField>
      </Form.Section>

      <Form.Section title={'Choices'}>
        <BoundField name={'frequency'}>
          <RadioGroup>
            <Radio value={'weekly'}>Weekly</Radio>
            <Radio value={'fortnightly'}>Every two weeks</Radio>
            <Radio value={'monthly'}>Monthly</Radio>
          </RadioGroup>
        </BoundField>
        <BoundField name={'days'}>
          <CheckboxGroup>
            <Checkbox value={'mon'}>Monday</Checkbox>
            <Checkbox value={'wed'}>Wednesday</Checkbox>
            <Checkbox value={'fri'}>Friday</Checkbox>
          </CheckboxGroup>
        </BoundField>
        <BoundField name={'view'}>
          {/* Never empty by its type: the default is the form's, and the binding hands the value over */}
          <SegmentedControl aria-label={'Opens as'} defaultValue={'list'}>
            <SegmentedControl.Item value={'list'}>List</SegmentedControl.Item>
            <SegmentedControl.Item value={'map'}>Map</SegmentedControl.Item>
          </SegmentedControl>
        </BoundField>
        <BoundField name={'notify'} label={undefined} span={6}><Switch>Notify the crew of changes</Switch></BoundField>
        <BoundField name={'terms'} label={undefined} span={6}><Checkbox>I accept the service terms</Checkbox></BoundField>
      </Form.Section>

      <Form.Footer>
        <Form.Cancel>Reset</Form.Cancel>
        <Form.Submit loadingLabel={'Saving'}>Save the round</Form.Submit>
      </Form.Footer>

      <Submitted value={submitted} />
    </BoundForm>
  );
}
