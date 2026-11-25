import * as React from 'react';

import { SegmentedControl } from '@proedis/ui/actions/segmented-control';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack align={'center'} gap={5}>
      {/* One item off: still in the arrow cycle, its tooltip says why */}
      <SegmentedControl aria-label={'View'} defaultValue={'table'}>
        <SegmentedControl.Item value={'table'}>Table</SegmentedControl.Item>
        <SegmentedControl.Item value={'map'} disabled disabledReason={'No stop of this route has coordinates'}>
          Map
        </SegmentedControl.Item>
      </SegmentedControl>

      {/* The whole control off, the reason repeated on every item */}
      <SegmentedControl aria-label={'Period'} defaultValue={'week'} disabled disabledReason={'The report is being recalculated'}>
        <SegmentedControl.Item value={'day'}>Day</SegmentedControl.Item>
        <SegmentedControl.Item value={'week'}>Week</SegmentedControl.Item>
        <SegmentedControl.Item value={'month'}>Month</SegmentedControl.Item>
      </SegmentedControl>
    </Stack>
  );
}
