import * as React from 'react';

import { MapPin } from 'lucide-react';

import { IconBox } from '@proedis/ui/display/icon-box';
import { Cluster } from '@proedis/ui/layout';

import type { IconBoxRadius } from '@proedis/ui/display/icon-box';


const RADII: readonly IconBoxRadius[] = [ 'none', 'sm', 'lg', 'default', 'full' ];


export default function Example(): React.ReactNode {
  return (
    <Cluster gap={'lg'} align={'end'}>
      {RADII.map((radius) => (
        <IconBox key={radius} tone={'primary'} radius={radius} title={`radius="${radius}"`}><MapPin /></IconBox>
      ))}
    </Cluster>
  );
}
