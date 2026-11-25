import * as React from 'react';

import { Detail } from '@proedis/ui/data/detail';
import { Stack } from '@proedis/ui/layout';

import { detailLabels } from '../labels';


/** The same values in a wide container and in a narrow one: below 32rem of grid the spans step in */
function Values(): React.ReactNode {
  return (
    <Detail labels={detailLabels}>
      <Detail.Section>
        <Detail.Grid>
          <Detail.Item label={'Code'} type={'text-code'}>RD-24017</Detail.Item>
          <Detail.Item label={'Date'} type={'date'}>16/11/2026</Detail.Item>
          <Detail.Item label={'Stops'} type={'number'}>38</Detail.Item>
          <Detail.Item label={'District'}>Borgo Po</Detail.Item>
          <Detail.Item label={'Driver'} type={'person'}>Rossi Anna</Detail.Item>
        </Detail.Grid>
      </Detail.Section>
    </Detail>
  );
}


export default function Example(): React.ReactNode {
  return (
    <Stack gap={8} className={'w-full'}>
      <Stack gap={2}>
        <p className={'text-xs font-medium text-muted-foreground'}>A wide grid</p>
        <Values />
      </Stack>

      <Stack gap={2} className={'max-w-xs rounded-lg border border-dashed border-border p-4'}>
        <p className={'text-xs font-medium text-muted-foreground'}>The same, in a drawer 20rem wide</p>
        <Values />
      </Stack>
    </Stack>
  );
}
