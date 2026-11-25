import * as React from 'react';

import { Recycle, Trash2, Wine } from 'lucide-react';

import { ToggleGroup, Toggle } from '@proedis/ui/actions/toggle';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack align={'center'} gap={5}>
      {/* Small, icon only: every item names itself and shows its tooltip */}
      <ToggleGroup aria-label={'Waste streams'} size={'sm'} defaultValue={[ 'paper' ]}>
        <Toggle value={'paper'} aria-label={'Paper'} leading={<Recycle />} />
        <Toggle value={'glass'} aria-label={'Glass'} leading={<Wine />} />
        <Toggle value={'residual'} aria-label={'Residual'} leading={<Trash2 />} />
      </ToggleGroup>

      {/* The whole group off: the reason is repeated in the tooltip of every item */}
      <ToggleGroup
        aria-label={'Layers'}
        defaultValue={[ 'stops' ]}
        disabled
        disabledReason={'The map is still loading'}
      >
        <Toggle value={'stops'}>Stops</Toggle>
        <Toggle value={'vehicles'}>Vehicles</Toggle>
      </ToggleGroup>
    </Stack>
  );
}
