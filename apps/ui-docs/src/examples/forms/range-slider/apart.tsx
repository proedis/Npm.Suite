import * as React from 'react';

import { RangeSlider } from '@proedis/ui/forms/range-slider';


/** A time window of at least two hours: the ends keep their distance */
export default function Example(): React.ReactNode {
  return (
    <RangeSlider
      className={'w-full max-w-sm'}
      label={'Collection window'}
      min={6}
      max={22}
      defaultValue={[ 8, 12 ]}
      minStepsBetweenValues={2}
      format={{ style: 'unit', unit: 'hour' }}
      labels={{ start: 'From', end: 'To' }}
    />
  );
}
