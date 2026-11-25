import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { Heading } from '@proedis/ui/display/heading';
import { Cluster, Stack } from '@proedis/ui/layout';


/**
 * Two families, scoped to one panel: the titles in a serif, the rest in a fixed width face. In an
 * application the block is `:root`, after the import of the stylesheet, with the fonts loaded first.
 */
const FONTS = `
  [data-font-demo='custom'] {
    --font-heading: Georgia, 'Times New Roman', serif;
    --font-sans: ui-monospace, Menlo, monospace;
    font-family: var(--font-sans);
  }
`;


function Panel(props: { demo: string; caption: string }): React.ReactNode {
  return (
    <Stack data-font-demo={props.demo} className={'rounded-xl border border-border bg-card p-4'}>
      <code className={'font-mono text-xs text-muted-foreground'}>{props.caption}</code>
      <Heading size={'lg'}>
        <Heading.Title>Vehicles in service</Heading.Title>
        <Heading.Description>Updated two minutes ago, 14 of 18 on the road.</Heading.Description>
      </Heading>
      <Cluster>
        <Button size={'sm'}>Open the map</Button>
        <Button size={'sm'} fill={'soft'}>Export</Button>
      </Cluster>
    </Stack>
  );
}


export default function Example(): React.ReactNode {
  return (
    <Stack columns={{ base: 1, md: 2 }} className={'w-full'}>
      <style>{FONTS}</style>
      <Panel demo={'default'} caption={'The defaults: --font-sans everywhere'} />
      <Panel demo={'custom'} caption={'--font-heading and --font-sans redeclared'} />
    </Stack>
  );
}
