import * as React from 'react';

import { Copy, Ellipsis, MapPin, Pencil, Trash2, Truck } from 'lucide-react';

import { IconButton } from '@proedis/ui/actions/button';
import { Menu } from '@proedis/ui/actions/menu';
import { Heading } from '@proedis/ui/display/heading';
import { IconBox } from '@proedis/ui/display/icon-box';
import { Item } from '@proedis/ui/display/item';
import { Surface } from '@proedis/ui/display/surface';
import { Stack } from '@proedis/ui/layout';


const VEHICLES = [
  { plate: 'FT-234-KL', model: 'Iveco Eurocargo, rear loader' },
  { plate: 'GH-118-PL', model: 'Mercedes Econic, side loader' }
] as const;


/**
 * The two actions used on every row stay on the row, as icon buttons whose names are their tooltips; the
 * rest wait in the menu. Three things to press at most: two buttons and the menu.
 */
export default function Example(): React.ReactNode {
  return (
    <Surface className={'w-full max-w-2xl'}>
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
                <IconButton label={`Edit ${vehicle.plate}`} icon={<Pencil />} onClick={() => window.console.info('Edit', vehicle.plate)} />
                <IconButton label={`Show ${vehicle.plate} on the map`} icon={<MapPin />} onClick={() => window.console.info('Map', vehicle.plate)} />
                <Menu aria-label={`More actions on ${vehicle.plate}`} trigger={<IconButton label={'More actions'} icon={<Ellipsis />} />}>
                  <Menu.Item icon={<Copy />} onSelect={() => window.console.info('Duplicate', vehicle.plate)}>Duplicate</Menu.Item>
                  <Menu.Separator />
                  <Menu.Item icon={<Trash2 />} tone={'destructive'} onSelect={() => window.console.info('Retire', vehicle.plate)}>
                    Retire the vehicle
                  </Menu.Item>
                </Menu>
              </Item.Actions>
            </Item>
          </li>
        ))}
      </Stack>
    </Surface>
  );
}
