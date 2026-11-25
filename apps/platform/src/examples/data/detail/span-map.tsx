import * as React from 'react';

import { Detail } from '@proedis/ui/data/detail';

import { detailLabels } from '../labels';


export default function Example(): React.ReactNode {
  return (
    <Detail labels={detailLabels} className={'w-full'}>
      <Detail.Section>
        <Detail.Grid>
          {/* A map is the caller's decision at every width of the window: the rule of the grid steps aside */}
          <Detail.Item label={'Start'} type={'date'} span={{ base: 6, sm: 3, lg: 2 }}>16/11/2026 06:10</Detail.Item>
          <Detail.Item label={'End'} type={'date'} span={{ base: 6, sm: 3, lg: 2 }}>16/11/2026 11:45</Detail.Item>

          {/* The first of two related values starts a new row, from md up */}
          <Detail.Item label={'Gross weight'} type={'number'} breakBefore={{ base: false, md: true }}>18,420 kg</Detail.Item>
          <Detail.Item label={'Net weight'} type={'number'}>6,460 kg</Detail.Item>
        </Detail.Grid>
      </Detail.Section>
    </Detail>
  );
}
