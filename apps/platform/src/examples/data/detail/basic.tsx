import * as React from 'react';

import { Detail } from '@proedis/ui/data/detail';

import { detailLabels } from '../labels';


export default function Example(): React.ReactNode {
  return (
    <Detail labels={detailLabels} className={'w-full'}>
      <Detail.Section title={'Customer'}>
        <Detail.Grid>
          <Detail.Item label={'Code'} type={'text-code'}>CL-004813</Detail.Item>
          <Detail.Item label={'Name'} type={'text-long'}>Panificio Rossi</Detail.Item>
          <Detail.Item label={'Contract'} type={'choice'}>Business</Detail.Item>
          <Detail.Item label={'Since'} type={'date'}>14/03/2019</Detail.Item>
          <Detail.Item label={'Bins'} type={'number'}>6</Detail.Item>
          <Detail.Item label={'Paperless invoices'} type={'boolean'}>{true}</Detail.Item>
        </Detail.Grid>
      </Detail.Section>
    </Detail>
  );
}
