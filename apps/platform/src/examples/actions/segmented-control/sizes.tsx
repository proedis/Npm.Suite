import * as React from 'react';

import { SegmentedControl } from '@proedis/ui/actions/segmented-control';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack align={'center'}>
      <SegmentedControl aria-label={'Period, large'} defaultValue={'week'} size={'lg'}>
        <SegmentedControl.Item value={'day'}>Day</SegmentedControl.Item>
        <SegmentedControl.Item value={'week'}>Week</SegmentedControl.Item>
        <SegmentedControl.Item value={'month'}>Month</SegmentedControl.Item>
      </SegmentedControl>
      <SegmentedControl aria-label={'Period, medium'} defaultValue={'week'} size={'md'}>
        <SegmentedControl.Item value={'day'}>Day</SegmentedControl.Item>
        <SegmentedControl.Item value={'week'}>Week</SegmentedControl.Item>
        <SegmentedControl.Item value={'month'}>Month</SegmentedControl.Item>
      </SegmentedControl>
      <SegmentedControl aria-label={'Period, small'} defaultValue={'week'} size={'sm'}>
        <SegmentedControl.Item value={'day'}>Day</SegmentedControl.Item>
        <SegmentedControl.Item value={'week'}>Week</SegmentedControl.Item>
        <SegmentedControl.Item value={'month'}>Month</SegmentedControl.Item>
      </SegmentedControl>
    </Stack>
  );
}
