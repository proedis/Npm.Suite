import * as React from 'react';

import { SegmentedControl } from '@proedis/ui/actions/segmented-control';
import { Detail, DETAIL_SPAN } from '@proedis/ui/data/detail';
import { Field } from '@proedis/ui/forms/field';
import { Form } from '@proedis/ui/forms/form';
import { TextInput } from '@proedis/ui/forms/text-input';
import { Stack } from '@proedis/ui/layout';

import { detailLabels } from '../labels';


type Mode = 'view' | 'edit';


export default function Example(): React.ReactNode {
  const [ mode, setMode ] = React.useState<Mode>('view');

  return (
    <Stack gap={5} className={'w-full'}>
      <SegmentedControl aria-label={'Mode'} size={'sm'} value={mode} onValueChange={(value) => setMode(value as Mode)}>
        <SegmentedControl.Item value={'view'}>View</SegmentedControl.Item>
        <SegmentedControl.Item value={'edit'}>Edit</SegmentedControl.Item>
      </SegmentedControl>

      {mode === 'view'
        ? (
          <Detail labels={detailLabels}>
            <Detail.Section title={'Customer'}>
              <Detail.Grid>
                <Detail.Item label={'Code'} type={'text-code'}>CL-004813</Detail.Item>
                <Detail.Item label={'Name'} type={'text-long'}>Panificio Rossi</Detail.Item>
                <Detail.Item label={'Contract'} type={'choice'}>Business</Detail.Item>
                <Detail.Item label={'Since'} type={'date'}>14/03/2019</Detail.Item>
                <Detail.Item label={'Bins'} type={'number'}>6</Detail.Item>
              </Detail.Grid>
            </Detail.Section>
          </Detail>
        )
        : (
          <Form>
            {/* The same order, the same spans: each field takes the place of its value */}
            <Form.Section title={'Customer'}>
              <Field span={DETAIL_SPAN['text-code']}>
                <Field.Label>Code</Field.Label>
                <TextInput width={'code'} defaultValue={'CL-004813'} />
              </Field>
              <Field span={DETAIL_SPAN['text-long']}>
                <Field.Label>Name</Field.Label>
                <TextInput width={'long'} defaultValue={'Panificio Rossi'} />
              </Field>
              <Field span={DETAIL_SPAN.choice}>
                <Field.Label>Contract</Field.Label>
                <TextInput defaultValue={'Business'} />
              </Field>
              <Field span={DETAIL_SPAN.date}>
                <Field.Label>Since</Field.Label>
                <TextInput width={'code'} defaultValue={'14/03/2019'} />
              </Field>
              <Field span={DETAIL_SPAN.number}>
                <Field.Label>Bins</Field.Label>
                <TextInput width={'code'} defaultValue={'6'} />
              </Field>
            </Form.Section>
          </Form>
        )}
    </Stack>
  );
}
