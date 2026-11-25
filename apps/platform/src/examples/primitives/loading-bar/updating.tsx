import * as React from 'react';

import { useDelayedBusy } from '@proedis/react';
import { SegmentedControl } from '@proedis/ui/actions/segmented-control';
import { cn } from '@proedis/ui/core';
import { Item } from '@proedis/ui/display/item';
import { Stack } from '@proedis/ui/layout';
import { LoadingBar } from '@proedis/ui/primitives';


const VEHICLES = {
  all    : [ 'FT-234-KL', 'GA-118-PR', 'EX-902-TT', 'BZ-441-MN' ],
  service: [ 'FT-234-KL', 'EX-902-TT' ]
} as const;


export default function Example(): React.ReactNode {
  const [ filter, setFilter ] = React.useState<keyof typeof VEHICLES>('all');
  const [ shown, setShown ] = React.useState<keyof typeof VEHICLES>('all');
  const wait = useDelayedBusy(filter !== shown);

  /** Stands in for the request: the list keeps the old rows until the new ones arrive */
  const handleChange = React.useCallback((value: string) => {
    const next = value as keyof typeof VEHICLES;

    setFilter(next);
    window.setTimeout(() => setShown(next), 1200);
  }, []);

  return (
    <Stack gap={3} className={'w-full max-w-md'}>
      <SegmentedControl aria-label={'Vehicles shown'} value={filter} onValueChange={handleChange}>
        <SegmentedControl.Item value={'all'}>All</SegmentedControl.Item>
        <SegmentedControl.Item value={'service'}>In service</SegmentedControl.Item>
      </SegmentedControl>

      <div className={'relative overflow-hidden rounded-xl border border-border'} aria-busy={wait.busy}>
        {wait.visible && <LoadingBar className={'absolute inset-x-0 top-0'} />}
        {/* Dimmed, not inert: the focus inside the list stays where it was */}
        <Stack gap={0} divided className={cn('transition-opacity', wait.visible && 'pointer-events-none opacity-70')}>
          {VEHICLES[shown].map((plate) => (
            <Item key={plate} inset className={'text-sm'}>{plate}</Item>
          ))}
        </Stack>
      </div>
    </Stack>
  );
}
