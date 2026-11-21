import * as React from 'react';

import { Check } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { Badge } from '@proedis/ui/display/badge';
import { Cluster, Stack } from '@proedis/ui/layout';


/**
 * The same tone written three ways, each scoped to one panel. In an application the block is `:root`
 * (and `.dark` for the dark values), after the import of the stylesheet.
 */
const TONES = `
  [data-tone-demo='palette'] {
    --primary: var(--color-violet-600);
    --primary-foreground: var(--color-white);
  }

  [data-tone-demo='oklch'] {
    --primary: oklch(0.55 0.17 160);
    --primary-foreground: oklch(0.99 0 0);
  }

  [data-tone-demo='rgb'] {
    --primary: rgb(217 70 39);
    --primary-foreground: rgb(255 255 255);
    --primary-soft: rgb(217 70 39 / 12%);
    --primary-soft-foreground: rgb(160 45 20);
  }
`;


function Panel(props: { title: string; demo: string }): React.ReactNode {
  return (
    <Stack data-tone-demo={props.demo} className={'rounded-xl border border-border bg-card p-4'}>
      <code className={'font-mono text-xs text-muted-foreground'}>{props.title}</code>
      <Cluster>
        <Button size={'sm'} leading={<Check />}>Confirm</Button>
        <Button size={'sm'} fill={'soft'}>Draft</Button>
        <Button size={'sm'} fill={'plain'}>Cancel</Button>
      </Cluster>
      <Cluster>
        <Badge fill={'solid'} tone={'primary'}>Live</Badge>
        <Badge fill={'soft'} tone={'primary'}>In service</Badge>
      </Cluster>
    </Stack>
  );
}


export default function Example(): React.ReactNode {
  return (
    <Stack columns={{ base: 1, md: 3 }} className={'w-full'}>
      <style>{TONES}</style>
      <Panel demo={'palette'} title={'var(--color-violet-600)'} />
      <Panel demo={'oklch'} title={'oklch(0.55 0.17 160)'} />
      <Panel demo={'rgb'} title={'rgb(217 70 39), soft declared'} />
    </Stack>
  );
}
