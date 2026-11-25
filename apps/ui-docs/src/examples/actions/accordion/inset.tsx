import * as React from 'react';

import { Accordion } from '@proedis/ui/actions/accordion';
import { Heading } from '@proedis/ui/display/heading';
import { Item } from '@proedis/ui/display/item';
import { Surface } from '@proedis/ui/display/surface';


export default function Example(): React.ReactNode {
  return (
    <Surface className={'w-full max-w-lg'}>
      <Surface.Header inset>
        <Item.Heading>
          <Heading.Title>Permissions</Heading.Title>
          <Heading.Description>What the dispatchers of the north depot can do</Heading.Description>
        </Item.Heading>
      </Surface.Header>

      {/* The rules sit between the items only: the first takes the line of the header, the card closes the last */}
      <Accordion inset defaultValue={[ 'routes' ]} className={'border-t border-border'}>
        <Accordion.Item value={'routes'} title={'Routes'} meta={'3 of 4'}>
          <p className={'px-6 pb-4 text-sm text-muted-foreground'}>Read, create and assign routes. Archiving is off.</p>
        </Accordion.Item>
        <Accordion.Item value={'vehicles'} title={'Vehicles'} meta={'1 of 4'}>
          <p className={'px-6 pb-4 text-sm text-muted-foreground'}>Read only.</p>
        </Accordion.Item>
      </Accordion>
    </Surface>
  );
}
