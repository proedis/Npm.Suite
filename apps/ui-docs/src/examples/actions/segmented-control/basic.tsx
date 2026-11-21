import * as React from 'react';

import { SegmentedControl } from '@proedis/ui/actions/segmented-control';


export default function Example(): React.ReactNode {
  const [ view, setView ] = React.useState('table');

  return (
    <SegmentedControl aria-label={'View'} value={view} onValueChange={setView}>
      <SegmentedControl.Item value={'table'}>Table</SegmentedControl.Item>
      <SegmentedControl.Item value={'map'}>Map</SegmentedControl.Item>
    </SegmentedControl>
  );
}
