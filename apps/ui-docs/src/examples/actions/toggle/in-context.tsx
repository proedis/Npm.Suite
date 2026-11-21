import * as React from 'react';

import { Crosshair, MapPin, RefreshCw, Truck } from 'lucide-react';

import { IconButton } from '@proedis/ui/actions/button';
import { ToggleGroup, Toggle } from '@proedis/ui/actions/toggle';
import { Stack } from '@proedis/ui/layout';
import { Divider } from '@proedis/ui/primitives';


export default function Example(): React.ReactNode {
  const [ layers, setLayers ] = React.useState<string[]>([ 'stops', 'vehicles' ]);
  const [ follow, setFollow ] = React.useState(true);

  return (
    <Stack
      direction={'horizontal'}
      align={'center'}
      gap={2}
      className={'rounded-lg border border-border bg-card p-1.5 shadow-sm'}
    >
      <ToggleGroup aria-label={'Layers of the map'} size={'sm'} value={layers} onValueChange={setLayers}>
        <Toggle value={'stops'} leading={<MapPin />}>Stops</Toggle>
        <Toggle value={'vehicles'} leading={<Truck />}>Vehicles</Toggle>
      </ToggleGroup>
      <Divider orientation={'vertical'} className={'h-5'} />
      <Toggle size={'sm'} aria-label={'Follow the vehicle'} leading={<Crosshair />} pressed={follow} onPressedChange={setFollow} />
      <IconButton size={'sm'} label={'Refresh'} icon={<RefreshCw />} />
    </Stack>
  );
}
