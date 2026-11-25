import * as React from 'react';

import { SegmentedControl } from '@proedis/ui/actions/segmented-control';
import { Stack } from '@proedis/ui/layout';

import type { SegmentedControlVariant } from '@proedis/ui/actions/segmented-control';


const VARIANTS: readonly SegmentedControlVariant[] = [ 'contained', 'elevated', 'plain' ];


/** The variants of Tabs: one look for the two, each with its own meaning */
export default function Example(): React.ReactNode {
  return (
    <Stack gap={'md'} align={'start'}>
      {VARIANTS.map((variant) => (
        <SegmentedControl key={variant} aria-label={`Period, ${variant}`} variant={variant} defaultValue={'week'}>
          <SegmentedControl.Item value={'day'}>Day</SegmentedControl.Item>
          <SegmentedControl.Item value={'week'}>Week</SegmentedControl.Item>
          <SegmentedControl.Item value={'month'}>Month</SegmentedControl.Item>
        </SegmentedControl>
      ))}
    </Stack>
  );
}
