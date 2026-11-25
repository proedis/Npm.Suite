import * as React from 'react';

import { Slider } from '@proedis/ui/forms/slider';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={'lg'} className={'w-full max-w-sm'}>
      <Slider label={'Opacity'} defaultValue={60} format={{ style: 'unit', unit: 'percent' }} />
      <Slider variant={'field'} label={'Opacity'} defaultValue={60} format={{ style: 'unit', unit: 'percent' }} />
      {[ 'sm', 'md', 'lg' ].map((size) => (
        <Slider
          key={size}
          variant={'field'}
          size={size as 'sm' | 'md' | 'lg'}
          label={`Zoom, ${size}`}
          min={1}
          max={8}
          defaultValue={4}
        />
      ))}
    </Stack>
  );
}
