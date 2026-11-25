import * as React from 'react';

import { SegmentedControl } from '@proedis/ui/actions/segmented-control';
import { Detail } from '@proedis/ui/data/detail';
import { Stack } from '@proedis/ui/layout';

import { detailLabels } from '../labels';


type State = 'ready' | 'loading' | 'error';


export default function Example(): React.ReactNode {
  const [ state, setState ] = React.useState<State>('loading');

  return (
    <Stack gap={5} className={'w-full'}>
      <SegmentedControl aria-label={'State of the second section'} size={'sm'} value={state} onValueChange={(value) => setState(value as State)}>
        <SegmentedControl.Item value={'ready'}>Ready</SegmentedControl.Item>
        <SegmentedControl.Item value={'loading'}>Loading</SegmentedControl.Item>
        <SegmentedControl.Item value={'error'}>Error</SegmentedControl.Item>
      </SegmentedControl>

      <Detail labels={detailLabels}>
        <Detail.Section title={'Round'}>
          <Detail.Grid>
            <Detail.Item label={'Code'} type={'text-code'}>RD-24017</Detail.Item>
            <Detail.Item label={'District'}>Borgo Po</Detail.Item>
            <Detail.Item label={'Date'} type={'date'}>16/11/2026</Detail.Item>
          </Detail.Grid>
        </Detail.Section>

        {/* The weighings arrive from a call of their own: the rest of the detail does not wait for them */}
        <Detail.Section
          title={'Weighings'}
          loading={state === 'loading'}
          error={state === 'error' ? 'The weighings could not be loaded.' : undefined}
          onRetry={() => setState('loading')}
        >
          <Detail.Grid>
            <Detail.Item label={'Gross weight'} type={'number'}>18,420 kg</Detail.Item>
            <Detail.Item label={'Tare'} type={'number'}>11,960 kg</Detail.Item>
            <Detail.Item label={'Net weight'} type={'number'}>6,460 kg</Detail.Item>
            <Detail.Item label={'Weighbridge'} type={'record'}>Chieri, scale 2</Detail.Item>
          </Detail.Grid>
        </Detail.Section>
      </Detail>
    </Stack>
  );
}
