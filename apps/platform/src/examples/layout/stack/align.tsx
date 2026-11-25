import * as React from 'react';

import { Stack } from '@proedis/ui/layout';

import type { Align } from '@proedis/ui/core';

import { Block } from '@/examples/layout/Block';


const ALIGNS: readonly Align[] = [ 'start', 'center', 'end', 'stretch', 'baseline' ];


export default function Example(): React.ReactNode {
  return (
    <Stack columns={{ base: 1, sm: 2, lg: 3 }} gap={6} className={'w-full'}>
      {ALIGNS.map((align) => (
        <Stack key={align} gap={2}>
          <span className={'font-mono text-xs text-muted-foreground'}>align={`'${align}'`}</span>
          <Stack direction={'horizontal'} align={align} gap={2} className={'h-28 rounded-lg border border-dashed border-border p-2'}>
            <Block className={'py-4'}>A</Block>
            <Block className={'text-base'}>B</Block>
            <Block>C</Block>
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}
