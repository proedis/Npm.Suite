import * as React from 'react';

import { Stack } from '@proedis/ui/layout';

import type { SpacingValue } from '@proedis/ui/core';

import { Block } from '@/examples/layout/Block';


/** A few steps of the spacing scale: one step is 0.25rem, so 4 is 1rem */
const STEPS: readonly SpacingValue[] = [ 0, 1, 2, 4, 8, 16 ];


export default function Example(): React.ReactNode {
  return (
    <Stack gap={3}>
      {STEPS.map((step) => (
        <Stack key={step} direction={'horizontal'} align={'center'} gap={4}>
          <span className={'w-16 font-mono text-xs text-muted-foreground'}>gap={step}</span>
          <Stack direction={'horizontal'} gap={step}>
            <Block>A</Block>
            <Block>B</Block>
            <Block>C</Block>
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}
