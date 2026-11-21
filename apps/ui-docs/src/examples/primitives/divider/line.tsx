import * as React from 'react';

import { Stack } from '@proedis/ui/layout';
import { Divider } from '@proedis/ui/primitives';

import type { DividerLineStyle, DividerLineWidth, DividerTone } from '@proedis/ui/primitives';


const LINES: readonly { tone: DividerTone; width: DividerLineWidth; style: DividerLineStyle }[] = [
  { tone: 'default', width: 1, style: 'solid' },
  { tone: 'primary', width: 2, style: 'solid' },
  { tone: 'muted', width: 1, style: 'dashed' },
  { tone: 'success', width: 2, style: 'dotted' },
  { tone: 'destructive', width: 4, style: 'double' }
];


export default function Example(): React.ReactNode {
  return (
    <Stack gap={'lg'} className={'w-full max-w-md'}>
      {LINES.map((line) => (
        <Stack key={`${line.tone}-${line.style}`} gap={'xs'}>
          <code className={'font-mono text-xs text-muted-foreground'}>
            lineTone={`'${line.tone}'`} lineWidth={`{${line.width}}`} lineStyle={`'${line.style}'`}
          </code>
          <Divider lineTone={line.tone} lineWidth={line.width} lineStyle={line.style} />
        </Stack>
      ))}
    </Stack>
  );
}
