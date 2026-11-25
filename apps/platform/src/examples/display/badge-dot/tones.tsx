import * as React from 'react';

import { BadgeDot } from '@proedis/ui/display/badge-dot';
import { Cluster, Stack } from '@proedis/ui/layout';

import type { BadgeDotSize } from '@proedis/ui/display/badge-dot';
import type { Tone } from '@proedis/ui/core';


const TONES: readonly Tone[] = [ 'muted', 'secondary', 'primary', 'success', 'warning', 'destructive', 'info' ];

const SIZES: readonly BadgeDotSize[] = [ 'xs', 'sm', 'md', 'lg' ];


export default function Example(): React.ReactNode {
  return (
    <Stack gap={'md'}>
      <Cluster gap={'md'}>
        {TONES.map((tone) => <BadgeDot key={tone} tone={tone} size={'md'} label={tone} />)}
      </Cluster>
      <Cluster gap={'md'} align={'center'}>
        {SIZES.map((size) => <BadgeDot key={size} size={size} label={`size ${size}`} />)}
      </Cluster>
    </Stack>
  );
}
