import * as React from 'react';

import { Heading } from '@proedis/ui/display/heading';
import { Item } from '@proedis/ui/display/item';
import { Surface } from '@proedis/ui/display/surface';


/** The parts render a div: give the title the level it has in the page */
export default function Example(): React.ReactNode {
  return (
    <Surface as={'section'} aria-labelledby={'fleet-title'} className={'w-full max-w-md border border-border'}>
      <Surface.Header>
        <Item.Heading size={'lg'}>
          <Heading.Title as={'h2'} id={'fleet-title'}>Fleet</Heading.Title>
          <Heading.Description as={'p'}>Twelve vehicles, nine in service</Heading.Description>
        </Item.Heading>
      </Surface.Header>
    </Surface>
  );
}
