import * as React from 'react';

import { cn, TONE_CLASSES, TONES } from '@proedis/ui/core';
import { Cluster, Stack } from '@proedis/ui/layout';

import type { Tone, ToneFill } from '@proedis/ui/core';


/**
 * A component of the application, painted from the same table as the package: a `warning` here is
 * the amber of every `warning` badge and button on the screen.
 */
function Pill(props: { tone: Tone; fill: ToneFill; children: React.ReactNode }): React.ReactNode {
  const { children, fill, tone } = props;

  return (
    <span className={cn('rounded-md px-2 py-1 text-xs font-medium', TONE_CLASSES[fill][tone])}>
      {children}
    </span>
  );
}


export default function Example(): React.ReactNode {
  return (
    <Stack gap={3}>
      {([ 'solid', 'soft', 'plain' ] as const).map((fill) => (
        <Cluster key={fill} gap={2}>
          {TONES.map((tone) => <Pill key={tone} tone={tone} fill={fill}>{tone}</Pill>)}
        </Cluster>
      ))}
    </Stack>
  );
}
