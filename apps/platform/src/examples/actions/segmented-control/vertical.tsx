import * as React from 'react';

import { List, MapIcon, Table } from 'lucide-react';

import { SegmentedControl } from '@proedis/ui/actions/segmented-control';
import { Cluster } from '@proedis/ui/layout';


/** A column: each item as wide as the widest, the arrows going up and down */
export default function Example(): React.ReactNode {
  return (
    <Cluster gap={'xl'} align={'start'}>
      <SegmentedControl aria-label={'View'} orientation={'vertical'} defaultValue={'table'}>
        <SegmentedControl.Item value={'table'} leading={<Table />}>Table</SegmentedControl.Item>
        <SegmentedControl.Item value={'list'} leading={<List />}>List</SegmentedControl.Item>
        <SegmentedControl.Item value={'map'} leading={<MapIcon />}>Map</SegmentedControl.Item>
      </SegmentedControl>
      <SegmentedControl aria-label={'View, plain'} orientation={'vertical'} variant={'plain'} defaultValue={'list'}>
        <SegmentedControl.Item value={'table'} leading={<Table />}>Table</SegmentedControl.Item>
        <SegmentedControl.Item value={'list'} leading={<List />}>List</SegmentedControl.Item>
        <SegmentedControl.Item value={'map'} leading={<MapIcon />}>Map</SegmentedControl.Item>
      </SegmentedControl>
    </Cluster>
  );
}
