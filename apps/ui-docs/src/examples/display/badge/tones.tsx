import * as React from 'react';

import { Badge } from '@proedis/ui/display/badge';
import { Stack } from '@proedis/ui/layout';

import type { Tone, ToneFill } from '@proedis/ui/core';


const TONES: readonly { tone: Tone; label: string }[] = [
  { tone: 'muted', label: 'Draft' },
  { tone: 'secondary', label: 'Archived' },
  { tone: 'primary', label: 'Planned' },
  { tone: 'success', label: 'Collected' },
  { tone: 'warning', label: 'Late' },
  { tone: 'destructive', label: 'Missed' },
  { tone: 'info', label: 'On the way' }
];

const FILLS: readonly ToneFill[] = [ 'soft', 'solid', 'plain' ];


export default function Example(): React.ReactNode {
  return (
    <Stack gap={3}>
      {TONES.map(({ label, tone }) => (
        <Stack key={tone} direction={'horizontal'} align={'center'} gap={4}>
          <span className={'w-24 font-mono text-xs text-muted-foreground'}>{tone}</span>
          {FILLS.map((fill) => (
            <Stack gap={0} key={fill} direction={'horizontal'} className={'w-24'}>
              <Badge fill={fill} tone={tone}>{label}</Badge>
            </Stack>
          ))}
        </Stack>
      ))}
    </Stack>
  );
}
