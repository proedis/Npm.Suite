import * as React from 'react';

import { SegmentedControl } from '@proedis/ui/actions/segmented-control';
import { Stack } from '@proedis/ui/layout';

import type { SegmentedControlRadius } from '@proedis/ui/actions/segmented-control';


const RADII: readonly SegmentedControlRadius[] = [ 'none', 'default', 'lg', 'full' ];


/** The items and the fill take the corner of the rail less its padding: the two stay concentric */
export default function Example(): React.ReactNode {
  return (
    <Stack gap={'md'} align={'start'}>
      {RADII.map((radius) => (
        <SegmentedControl key={radius} aria-label={`Period, radius ${radius}`} radius={radius} defaultValue={'week'}>
          <SegmentedControl.Item value={'day'}>Day</SegmentedControl.Item>
          <SegmentedControl.Item value={'week'}>Week</SegmentedControl.Item>
          <SegmentedControl.Item value={'month'}>{`radius="${radius}"`}</SegmentedControl.Item>
        </SegmentedControl>
      ))}
    </Stack>
  );
}
