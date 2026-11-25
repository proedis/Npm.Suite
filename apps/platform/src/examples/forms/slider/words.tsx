import * as React from 'react';

import { Slider } from '@proedis/ui/forms/slider';
import { Stack } from '@proedis/ui/layout';


/** A unit through Intl, words through valueText: nothing of the text is the component's */
export default function Example(): React.ReactNode {
  return (
    <Stack gap={'lg'} className={'w-full max-w-sm'}>
      <Slider label={'Radius of the search'} min={0} max={50} step={5} defaultValue={15} format={{ style: 'unit', unit: 'kilometer' }} />
      <Slider
        label={'Stops per round'}
        min={10}
        max={60}
        defaultValue={38}
        valueText={(text) => `${text} stops`}
      />
    </Stack>
  );
}
