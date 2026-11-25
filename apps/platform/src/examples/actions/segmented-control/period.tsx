import * as React from 'react';

import { SegmentedControl } from '@proedis/ui/actions/segmented-control';
import { Stack } from '@proedis/ui/layout';


const COLLECTED: Readonly<Record<string, string>> = {
  day  : '4.2 tonnes collected today',
  week : '27.8 tonnes collected this week',
  month: '118.5 tonnes collected this month'
};


export default function Example(): React.ReactNode {
  const [ period, setPeriod ] = React.useState('week');

  return (
    <Stack align={'center'} gap={4}>
      <SegmentedControl aria-label={'Period'} value={period} onValueChange={setPeriod}>
        <SegmentedControl.Item value={'day'}>Day</SegmentedControl.Item>
        <SegmentedControl.Item value={'week'}>Week</SegmentedControl.Item>
        <SegmentedControl.Item value={'month'}>Month</SegmentedControl.Item>
      </SegmentedControl>
      <p className={'text-sm text-muted-foreground'}>{COLLECTED[period]}</p>
    </Stack>
  );
}
