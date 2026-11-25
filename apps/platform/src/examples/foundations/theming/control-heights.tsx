import * as React from 'react';

import { CalendarDays, Search, Truck } from 'lucide-react';

import { Button, IconButton } from '@proedis/ui/actions/button';
import { SegmentedControl } from '@proedis/ui/actions/segmented-control';
import { Toggle } from '@proedis/ui/actions/toggle';
import { DatePicker } from '@proedis/ui/forms/date-picker';
import { Select } from '@proedis/ui/forms/select';
import { TextInput } from '@proedis/ui/forms/text-input';
import { Stack } from '@proedis/ui/layout';

import type { ControlSize } from '@proedis/ui/core';

import dateLabels from '@/examples/forms/date-picker/labels';
import selectLabels from '@/examples/forms/select/labels';
import { DEPOTS } from '@/examples/forms/select/options';


const SIZES: readonly ControlSize[] = [ 'sm', 'md', 'lg' ];


/** The three heights as this browser resolves them, read again when the pointer changes */
const COARSE = '(pointer: coarse)';

function subscribe(onChange: () => void): () => void {
  const query = window.matchMedia(COARSE);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function readHeights(): string {
  const style = getComputedStyle(document.documentElement);
  return SIZES.map((size) => style.getPropertyValue(`--spacing-control-${size}`).trim()).join(' ');
}

function useControlHeights(): Record<ControlSize, string> {
  const [ sm = '', md = '', lg = '' ] = React.useSyncExternalStore(subscribe, readHeights, () => '').split(' ');
  return { sm, md, lg };
}


/** One row per size, every kind of control in it, lined up on the top edge so a step off would show at the bottom */
export default function Example(): React.ReactNode {
  const heights = useControlHeights();

  return (
    <Stack gap={'lg'} className={'w-full'}>
      {SIZES.map((size) => (
        <Stack key={size} gap={'xs'}>
          <code className={'font-mono text-xs text-muted-foreground'}>size={`'${size}'`} · {heights[size]}</code>
          <Stack direction={'horizontal'} align={'start'} wrap gap={'sm'}>
            <TextInput size={size} aria-label={'Search'} placeholder={'Search a vehicle'} leading={<Search />} className={'w-44'} />
            <Select size={size} options={DEPOTS} defaultValue={'chieri'} aria-label={'Depot'} labels={selectLabels} className={'w-36'} />
            <DatePicker size={size} locale={'en-GB'} labels={dateLabels} aria-label={'Collection date'} />
            <SegmentedControl size={size} aria-label={'View'} defaultValue={'table'}>
              <SegmentedControl.Item value={'table'}>Table</SegmentedControl.Item>
              <SegmentedControl.Item value={'map'}>Map</SegmentedControl.Item>
            </SegmentedControl>
            <Toggle size={size} leading={<CalendarDays />}>Today</Toggle>
            <IconButton size={size} label={'Vehicles'} icon={<Truck />} />
            <Button size={size}>Search</Button>
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}
