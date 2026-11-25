import * as React from 'react';

import { Stack } from '@proedis/ui/layout';

import type { Justify } from '@proedis/ui/core';

import { Block } from '@/examples/layout/Block';


const JUSTIFIES: readonly Justify[] = [ 'start', 'center', 'end', 'between', 'around', 'evenly' ];


export default function Example(): React.ReactNode {
  return (
    <Stack gap={3} className={'w-full'}>
      {JUSTIFIES.map((justify) => (
        <Stack key={justify} gap={1.5}>
          <span className={'font-mono text-xs text-muted-foreground'}>justify={`'${justify}'`}</span>
          <Stack direction={'horizontal'} justify={justify} gap={2} className={'rounded-lg border border-dashed border-border p-2'}>
            <Block>A</Block>
            <Block>B</Block>
            <Block>C</Block>
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}
