import * as React from 'react';

import { Pencil, Truck } from 'lucide-react';

import { IconButton } from '@proedis/ui/actions/button';
import { Heading } from '@proedis/ui/display/heading';
import { IconBox } from '@proedis/ui/display/icon-box';
import { Item } from '@proedis/ui/display/item';
import { Surface } from '@proedis/ui/display/surface';
import { Stack } from '@proedis/ui/layout';

import { DomReadout } from '@/examples/foundations/DomReadout';


export default function Example(): React.ReactNode {
  const ref = React.useRef<HTMLDivElement>(null);

  return (
    <Stack gap={4} className={'w-full max-w-lg'}>
      <div ref={ref}>
        <Surface className={'border border-border'}>
          <Surface.Header inset>
            <Item.Icon><IconBox fill={'soft'} tone={'primary'}><Truck /></IconBox></Item.Icon>
            <Item.Heading>
              <Heading.Title>FT-234-KL</Heading.Title>
              <Heading.Description>Compactor, 18 t</Heading.Description>
            </Item.Heading>
            <Item.Actions>
              <IconButton label={'Edit'} icon={<Pencil />} />
            </Item.Actions>
          </Surface.Header>
          <Surface.Separator />
          <Surface.Section>Next service in 420 km.</Surface.Section>
        </Surface>
      </div>

      {/* A helper of this site: every element with a data-slot, with its data-* attributes */}
      <DomReadout of={ref} />
    </Stack>
  );
}
