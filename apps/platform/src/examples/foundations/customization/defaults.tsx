import * as React from 'react';

import { Cluster, Stack } from '@proedis/ui/layout';

import { Block } from '@/examples/layout/Block';


/** A region of the application with its own defaults: the gaps nobody declared, and only those */
const TIGHT = { '--stack-gap': 'var(--space-xs)', '--cluster-gap': 'var(--space-xs)' } as React.CSSProperties;


function Panel(props: { title: string }): React.ReactNode {
  return (
    <Stack>
      <span className={'text-xs font-medium text-muted-foreground'}>{props.title}</span>
      <Block>Route 12, Chieri north</Block>
      <Block>Route 14, Pino Torinese</Block>
      <Cluster>
        <Block>Plastic</Block>
        <Block>Paper</Block>
        <Block>Glass</Block>
      </Cluster>
      <Stack gap={'lg'}>
        <Block>gap=’lg’, declared: it does not move</Block>
        <Block>Route 21, Baldissero</Block>
      </Stack>
    </Stack>
  );
}


export default function Example(): React.ReactNode {
  return (
    <Stack columns={{ base: 1, md: 2 }} gap={'xl'} className={'w-full'}>
      <Panel title={'The defaults of the theme'} />
      <div style={TIGHT}>
        <Panel title={'--stack-gap and --cluster-gap at xs'} />
      </div>
    </Stack>
  );
}
