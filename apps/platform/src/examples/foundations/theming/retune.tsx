import * as React from 'react';

import { Check, Truck } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { Badge } from '@proedis/ui/display/badge';
import { IconBox } from '@proedis/ui/display/icon-box';
import { TextInput } from '@proedis/ui/forms/text-input';
import { Cluster, Stack } from '@proedis/ui/layout';


/**
 * What an application writes in its own stylesheet, on `:root` and `.dark`. Here it is scoped to one
 * container, so the rest of the page keeps the defaults: the components read the variables wherever
 * they sit, and the closest declaration wins.
 */
const RETUNED = `
  [data-theme-demo='retuned'] {
    --primary: oklch(0.511 0.262 276.966);
    --primary-foreground: oklch(0.985 0 0);
    --ring: oklch(0.673 0.182 276.935);
    --radius-scale: 1.75;
  }

  .dark [data-theme-demo='retuned'] {
    --primary: oklch(0.673 0.182 276.935);
    --primary-foreground: oklch(0.21 0.006 285.885);
  }
`;


function Panel(props: { title: string }): React.ReactNode {
  return (
    <Stack gap={4} className={'rounded-xl border border-border bg-card p-5'}>
      <p className={'text-sm font-semibold text-foreground'}>{props.title}</p>
      <Cluster gap={2}>
        <Button leading={<Check />}>Confirm</Button>
        <Button fill={'soft'}>Save as draft</Button>
      </Cluster>
      <Cluster gap={2}>
        <IconBox fill={'soft'} tone={'primary'}><Truck /></IconBox>
        <Badge fill={'soft'} tone={'primary'}>In service</Badge>
        <Badge fill={'solid'} tone={'primary'} dot>Live</Badge>
      </Cluster>
      <TextInput aria-label={'Plate'} placeholder={'FT-234-KL'} />
    </Stack>
  );
}


export default function Example(): React.ReactNode {
  return (
    <Stack columns={{ base: 1, md: 2 }} gap={4} className={'w-full'}>
      <style>{RETUNED}</style>
      <Stack gap={0} data-theme-demo={'default'}>
        <Panel title={'The defaults'} />
      </Stack>
      <Stack gap={0} data-theme-demo={'retuned'}>
        <Panel title={'Four tokens redeclared'} />
      </Stack>
    </Stack>
  );
}
