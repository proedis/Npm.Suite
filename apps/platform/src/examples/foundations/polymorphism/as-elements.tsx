import * as React from 'react';

import { Heading } from '@proedis/ui/display/heading';
import { Item } from '@proedis/ui/display/item';
import { Surface } from '@proedis/ui/display/surface';
import { Stack } from '@proedis/ui/layout';

import { DomReadout } from '@/examples/foundations/DomReadout';


export default function Example(): React.ReactNode {
  const ref = React.useRef<HTMLDivElement>(null);

  return (
    <Stack gap={4} className={'w-full max-w-md'}>
      <div ref={ref}>
        <Surface as={'article'}>
          <Surface.Header inset>
            <Item.Heading>
              <Heading.Title as={'h3'}>Round 14</Heading.Title>
              <Heading.Description>North district, 38 stops</Heading.Description>
            </Item.Heading>
          </Surface.Header>
          <Stack as={'ul'} gap={1} className={'px-2 pb-2'}>
            <Item as={'li'} inset>Via Roma 12</Item>
            <Item as={'li'} inset>Corso Torino 4</Item>
          </Stack>
        </Surface>
      </div>

      {/* A helper of this site: the elements the page really rendered */}
      <DomReadout of={ref} selector={'[data-slot], li'} />
    </Stack>
  );
}
