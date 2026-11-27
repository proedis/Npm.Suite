import * as React from 'react';

import { Copy, Ellipsis, Pencil, Plus, Trash2, Truck } from 'lucide-react';

import { Button, IconButton } from '@proedis/ui/actions/button';
import { Menu } from '@proedis/ui/actions/menu';
import { Badge } from '@proedis/ui/display/badge';
import { Heading } from '@proedis/ui/display/heading';
import { IconBox } from '@proedis/ui/display/icon-box';
import { Item } from '@proedis/ui/display/item';
import { Surface } from '@proedis/ui/display/surface';
import { Stack } from '@proedis/ui/layout';


const VEHICLES = [
  { plate: 'FT-234-KL', model: 'Iveco Eurocargo, rear loader', status: 'In service', tone: 'success' },
  { plate: 'GH-118-PL', model: 'Mercedes Econic, side loader', status: 'In the workshop', tone: 'warning' },
  { plate: 'AB-901-CD', model: 'Isuzu NPR, small compactor', status: 'In service', tone: 'success' }
] as const;


/**
 * Rows whose actions are the interactive part: the row itself is not a button, so its menu can be one.
 * The menu of each row names the record it acts on.
 */
export default function Example(): React.ReactNode {
  return (
    <Surface className={'w-full max-w-2xl'}>
      <Surface.Header>
        <Item.Heading>
          <Heading.Title as={'h3'}>Vehicles</Heading.Title>
          <Heading.Description>North depot, 3 of 14</Heading.Description>
        </Item.Heading>
        <Item.Actions>
          <Button size={'sm'} leading={<Plus />}>New vehicle</Button>
        </Item.Actions>
      </Surface.Header>

      <Stack gap={0} as={'ul'} divided>
        {VEHICLES.map((vehicle) => (
          <li key={vehicle.plate}>
            <Item inset>
              <Item.Icon><IconBox size={'sm'} fill={'soft'} tone={'secondary'}><Truck /></IconBox></Item.Icon>
              <Item.Heading>
                <Heading.Title>{vehicle.plate}</Heading.Title>
                <Heading.Description>{vehicle.model}</Heading.Description>
              </Item.Heading>
              <Item.Actions>
                <Badge dot tone={vehicle.tone}>{vehicle.status}</Badge>
                <Menu aria-label={`Actions on ${vehicle.plate}`} trigger={<IconButton label={'Actions'} icon={<Ellipsis />} />}>
                  <Menu.Item icon={<Pencil />}>Edit</Menu.Item>
                  <Menu.Item icon={<Copy />}>Duplicate</Menu.Item>
                  <Menu.Separator />
                  <Menu.Item icon={<Trash2 />} tone={'destructive'}>Retire the vehicle</Menu.Item>
                </Menu>
              </Item.Actions>
            </Item>
          </li>
        ))}
      </Stack>
    </Surface>
  );
}
