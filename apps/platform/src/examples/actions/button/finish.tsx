import * as React from 'react';

import { Check, Download } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { Cluster, Stack } from '@proedis/ui/layout';


/**
 * The theme of the example, scoped to its panel. In an application the same declarations go in
 * `:root`, after the import of the stylesheet, and every solid button takes them.
 */
const THEME = `
  [data-finish-demo] {
    --primary: oklch(0.53 0.17 256);
    --primary-foreground: oklch(0.99 0 0);
    --button-radius: var(--radius-2xl);
    --button-gradient: 0.12;
    --button-border-shade: 22%;
    --button-highlight: 0.3;
    --button-glow: 0.5;
    --button-press-scale: 0.97;
    --button-press-translate: 0 1px;
  }
`;


export default function Example(): React.ReactNode {
  return (
    <Stack data-finish-demo align={'center'} gap={'xl'} className={'w-full rounded-xl bg-primary-soft py-10'}>
      <style>{THEME}</style>

      {/*
        The call to action of a landing: larger than a control, so the size is this button's own. A button
        tightens its padding on the side of an icon, so a size of its own states that side too
      */}
      <Button
        leading={<Download />}
        size={'lg'}
        className={'h-14 px-8 text-lg font-semibold has-[[data-slot=button-leading]]:ps-7 [&_svg]:size-5'}
      >
        Download for Mac
      </Button>

      {/* The same theme on ordinary buttons: the finish reaches the solid fill, in the colour of each tone */}
      <Cluster justify={'center'}>
        <Button leading={<Check />}>Confirm</Button>
        <Button tone={'success'}>Approve</Button>
        <Button tone={'destructive'}>Delete</Button>
        <Button fill={'soft'}>Draft</Button>
        <Button fill={'plain'}>Cancel</Button>
      </Cluster>
    </Stack>
  );
}
