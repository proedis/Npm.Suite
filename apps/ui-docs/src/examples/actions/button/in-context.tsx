import * as React from 'react';

import { Copy, Ellipsis, Pencil, Trash2 } from 'lucide-react';

import { Button, IconButton } from '@proedis/ui/actions/button';
import { Menu } from '@proedis/ui/actions/menu';
import { Heading } from '@proedis/ui/display/heading';
import { Item } from '@proedis/ui/display/item';
import { Surface } from '@proedis/ui/display/surface';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Surface className={'w-full max-w-lg border border-border'}>
      <Surface.Header inset>
        <Item.Heading>
          <Heading.Title>Collection round 14</Heading.Title>
          <Heading.Description>Monday, north district, 38 stops</Heading.Description>
        </Item.Heading>
        <Item.Actions>
          <IconButton label={'Edit'} icon={<Pencil />} />
          <Menu
            aria-label={'Actions on collection round 14'}
            trigger={<IconButton label={'More actions'} icon={<Ellipsis />} />}
          >
            <Menu.Item icon={<Copy />}>Duplicate</Menu.Item>
            <Menu.Separator />
            <Menu.Item icon={<Trash2 />} tone={'destructive'}>Delete</Menu.Item>
          </Menu>
        </Item.Actions>
      </Surface.Header>

      <Surface.Footer muted justify={'between'}>
        <Button fill={'plain'} tone={'destructive'}>Cancel the round</Button>
        <Stack direction={'horizontal'} gap={2}>
          <Button fill={'plain'} tone={'muted'}>Close</Button>
          <Button>Start the round</Button>
        </Stack>
      </Surface.Footer>
    </Surface>
  );
}
