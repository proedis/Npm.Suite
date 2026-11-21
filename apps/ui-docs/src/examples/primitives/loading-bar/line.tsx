import * as React from 'react';

import { Stack } from '@proedis/ui/layout';
import { LoadingBar } from '@proedis/ui/primitives';

import type { LoadingBarLineWidth } from '@proedis/ui/primitives';
import type { Tone } from '@proedis/ui/core';


const BARS: readonly { tone: Tone; width: LoadingBarLineWidth }[] = [
  { tone: 'primary', width: 1 },
  { tone: 'primary', width: 2 },
  { tone: 'info', width: 3 },
  { tone: 'success', width: 4 },
  { tone: 'muted', width: 2 }
];


export default function Example(): React.ReactNode {
  return (
    <Stack gap={'lg'} className={'w-full max-w-md'}>
      {BARS.map((bar) => (
        <Stack key={`${bar.tone}-${bar.width}`} gap={'xs'}>
          <code className={'font-mono text-xs text-muted-foreground'}>lineTone={`'${bar.tone}'`} lineWidth={`{${bar.width}}`}</code>
          <LoadingBar lineTone={bar.tone} lineWidth={bar.width} />
        </Stack>
      ))}
    </Stack>
  );
}
