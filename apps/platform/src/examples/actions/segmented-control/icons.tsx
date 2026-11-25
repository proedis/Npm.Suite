import * as React from 'react';

import { LayoutGrid, List, MapIcon } from 'lucide-react';

import { SegmentedControl } from '@proedis/ui/actions/segmented-control';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack align={'center'} gap={5}>
      <SegmentedControl aria-label={'View'} defaultValue={'list'}>
        <SegmentedControl.Item value={'list'} leading={<List />}>List</SegmentedControl.Item>
        <SegmentedControl.Item value={'cards'} leading={<LayoutGrid />}>Cards</SegmentedControl.Item>
        <SegmentedControl.Item value={'map'} leading={<MapIcon />}>Map</SegmentedControl.Item>
      </SegmentedControl>

      {/* Icon only: the aria-label of each item is its name and the text of its tooltip */}
      <SegmentedControl aria-label={'View'} defaultValue={'list'}>
        <SegmentedControl.Item value={'list'} leading={<List />} aria-label={'List'} />
        <SegmentedControl.Item value={'cards'} leading={<LayoutGrid />} aria-label={'Cards'} />
        <SegmentedControl.Item value={'map'} leading={<MapIcon />} aria-label={'Map'} />
      </SegmentedControl>
    </Stack>
  );
}
