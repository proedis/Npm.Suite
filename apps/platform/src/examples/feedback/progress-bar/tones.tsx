import * as React from 'react';

import { ProgressBar } from '@proedis/ui/feedback/progress-bar';
import { Stack } from '@proedis/ui/layout';

import type { Tone } from '@proedis/ui/core';


const TONES: readonly Tone[] = [ 'primary', 'success', 'warning', 'destructive', 'info', 'secondary', 'muted' ];


export default function Example(): React.ReactNode {
  return (
    <Stack gap={'md'} className={'w-full max-w-md'}>
      {TONES.map((tone, index) => (
        <ProgressBar key={tone} tone={tone} track={'tone'} label={tone} value={30 + (index * 10)} valuePosition={'end'} />
      ))}
      <ProgressBar tone={'primary'} track={'none'} label={'track="none"'} value={64} valuePosition={'end'} />
    </Stack>
  );
}
