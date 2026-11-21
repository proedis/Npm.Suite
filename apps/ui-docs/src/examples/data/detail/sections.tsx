import * as React from 'react';

import { Detail } from '@proedis/ui/data/detail';

import { detailLabels } from '../labels';


export default function Example(): React.ReactNode {
  return (
    <Detail labels={detailLabels} className={'w-full'}>
      <Detail.Section title={'Round'}>
        <Detail.Grid>
          <Detail.Item label={'Code'} type={'text-code'} copyable>RD-24017</Detail.Item>
          <Detail.Item label={'District'}>Borgo Po</Detail.Item>
          <Detail.Item label={'Date'} type={'date'}>16/11/2026</Detail.Item>
          <Detail.Item label={'Driver'} type={'person'}>Rossi Anna</Detail.Item>
          <Detail.Item label={'Vehicle'} type={'text-code'} copyable>FA-644-DM</Detail.Item>
          <Detail.Item label={'Notes'} type={'paragraph'}>{null}</Detail.Item>
        </Detail.Grid>
      </Detail.Section>

      <Detail.Section title={'Depot contact'}>
        <Detail.Grid>
          <Detail.Item label={'Email'} type={'text-long'} copyable>dispatch.borgopo@example.com</Detail.Item>
          <Detail.Item label={'Phone'} type={'text-code'} copyable>+39 011 555 0142</Detail.Item>
        </Detail.Grid>
      </Detail.Section>

      {/* A section that is one collection: the label is read, not shown, and the value takes the row */}
      <Detail.Section title={'Materials'}>
        <Detail.Grid>
          <Detail.Item label={'Materials collected'} type={'list'} hideLabel>Paper, glass, plastic, organic</Detail.Item>
        </Detail.Grid>
      </Detail.Section>
    </Detail>
  );
}
