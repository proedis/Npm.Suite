import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { Heading } from '@proedis/ui/display/heading';
import { Item } from '@proedis/ui/display/item';
import { Surface } from '@proedis/ui/display/surface';


export default function Example(): React.ReactNode {
  return (
    <Surface className={'w-full max-w-md'}>
      <Surface.Header>
        <Item.Heading size={'lg'}>
          <Heading.Title>Weekly report</Heading.Title>
          <Heading.Description>Monday 16 to Sunday 22 November</Heading.Description>
        </Item.Heading>
      </Surface.Header>
      <Surface.Separator />
      <Surface.Section>
        <p className={'text-sm text-muted-foreground'}>
          The rounds covered 96% of the planned stops. Two skips were not reachable and are planned again for Monday.
        </p>
      </Surface.Section>
      <Surface.Footer>
        <Button fill={'plain'} tone={'muted'}>Close</Button>
        <Button>Send to the municipality</Button>
      </Surface.Footer>
    </Surface>
  );
}
