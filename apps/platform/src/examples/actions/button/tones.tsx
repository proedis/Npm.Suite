import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { Stack } from '@proedis/ui/layout';

import type { Tone, ToneFill } from '@proedis/ui/core';


/** Each tone with an action that means it */
const TONES: readonly { tone: Tone; label: string }[] = [
  { tone: 'primary', label: 'Create' },
  { tone: 'secondary', label: 'Export' },
  { tone: 'muted', label: 'Filters' },
  { tone: 'success', label: 'Approve' },
  { tone: 'warning', label: 'Review' },
  { tone: 'destructive', label: 'Delete' },
  { tone: 'info', label: 'Details' }
];

const FILLS: readonly ToneFill[] = [ 'solid', 'soft', 'plain' ];


export default function Example(): React.ReactNode {
  return (
    <Stack gap={3}>
      {TONES.map(({ label, tone }) => (
        <Stack key={tone} direction={'horizontal'} align={'center'} gap={3}>
          <span className={'w-24 font-mono text-xs text-muted-foreground'}>{tone}</span>
          {FILLS.map((fill) => (
            <Button key={fill} fill={fill} tone={tone} className={'w-24'}>{label}</Button>
          ))}
        </Stack>
      ))}
    </Stack>
  );
}
