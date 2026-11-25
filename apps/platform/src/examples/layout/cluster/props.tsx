import * as React from 'react';

import { Cluster, Stack } from '@proedis/ui/layout';

import { Block } from '@/examples/layout/Block';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={6} className={'w-full max-w-md'}>
      <Stack gap={1.5}>
        <span className={'font-mono text-xs text-muted-foreground'}>{'gap={4}'}</span>
        <Cluster gap={4}>
          <Block>Monday</Block>
          <Block>Wednesday</Block>
          <Block>Friday</Block>
        </Cluster>
      </Stack>

      <Stack gap={1.5}>
        <span className={'font-mono text-xs text-muted-foreground'}>{'justify={\'end\'}'}</span>
        <Cluster justify={'end'} className={'rounded-lg border border-dashed border-border p-2'}>
          <Block>Cancel</Block>
          <Block>Save</Block>
        </Cluster>
      </Stack>

      <Stack gap={1.5}>
        <span className={'font-mono text-xs text-muted-foreground'}>{'align={\'start\'}'}</span>
        <Cluster align={'start'} className={'rounded-lg border border-dashed border-border p-2'}>
          <Block className={'py-5'}>Tall</Block>
          <Block>Short</Block>
          <Block>Short</Block>
        </Cluster>
      </Stack>
    </Stack>
  );
}
