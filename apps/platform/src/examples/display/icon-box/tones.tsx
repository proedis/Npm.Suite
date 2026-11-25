import * as React from 'react';

import { AlertTriangle, Archive, Check, CircleHelp, Package, Trash2, Truck } from 'lucide-react';

import { IconBox } from '@proedis/ui/display/icon-box';
import { Stack } from '@proedis/ui/layout';

import type { Tone, ToneFill } from '@proedis/ui/core';


const TONES: readonly { tone: Tone; icon: React.ReactNode }[] = [
  { tone: 'muted', icon: <Package /> },
  { tone: 'secondary', icon: <Archive /> },
  { tone: 'primary', icon: <Truck /> },
  { tone: 'success', icon: <Check /> },
  { tone: 'warning', icon: <AlertTriangle /> },
  { tone: 'destructive', icon: <Trash2 /> },
  { tone: 'info', icon: <CircleHelp /> }
];

const FILLS: readonly ToneFill[] = [ 'soft', 'solid', 'plain' ];


export default function Example(): React.ReactNode {
  return (
    <Stack gap={3}>
      {FILLS.map((fill) => (
        <Stack key={fill} direction={'horizontal'} align={'center'} gap={3}>
          <span className={'w-12 font-mono text-xs text-muted-foreground'}>{fill}</span>
          {TONES.map(({ icon, tone }) => (
            <IconBox key={tone} fill={fill} tone={tone}>{icon}</IconBox>
          ))}
        </Stack>
      ))}
    </Stack>
  );
}
