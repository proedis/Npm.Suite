import * as React from 'react';

import { Ellipsis, MapPin, Pencil, Trash2, Truck } from 'lucide-react';

import { IconButton } from '@proedis/ui/actions/button';
import { Menu } from '@proedis/ui/actions/menu';
import { Badge } from '@proedis/ui/display/badge';
import { Heading } from '@proedis/ui/display/heading';
import { Item } from '@proedis/ui/display/item';
import { Surface } from '@proedis/ui/display/surface';
import { Divider } from '@proedis/ui/primitives';


const ROUTES = [
  { code: 'R-12', zone: 'North district', stops: 38, state: 'In progress' },
  { code: 'R-14', zone: 'Old town', stops: 24, state: 'Planned' },
  { code: 'R-21', zone: 'Industrial area', stops: 11, state: 'Planned' }
] as const;


export default function Example(): React.ReactNode {
  return (
    <Surface className={'w-full max-w-lg border border-border'}>
      {ROUTES.map((route, index) => (
        <React.Fragment key={route.code}>
          {index > 0 && <Divider />}
          <Item inset>
            <Heading>
              <Heading.Title size={'sm'}>{`${route.code}, ${route.zone}`}</Heading.Title>
              <Heading.Description>{`${route.stops} stops`}</Heading.Description>
            </Heading>
            <Item.Actions>
              <Badge fill={'soft'} tone={route.state === 'In progress' ? 'info' : 'muted'}>{route.state}</Badge>
              <Menu
                aria-label={`Actions on route ${route.code}`}
                trigger={<IconButton label={'Actions'} icon={<Ellipsis />} />}
              >
                <Menu.Item icon={<MapPin />}>Show on the map</Menu.Item>
                <Menu.Item icon={<Truck />}>Change vehicle</Menu.Item>
                <Menu.Item icon={<Pencil />}>Edit</Menu.Item>
                <Menu.Separator />
                <Menu.Item
                  icon={<Trash2 />}
                  tone={'destructive'}
                  disabled={route.state === 'In progress'}
                  description={route.state === 'In progress' ? 'A route in progress cannot be deleted' : undefined}
                >
                  Delete
                </Menu.Item>
              </Menu>
            </Item.Actions>
          </Item>
        </React.Fragment>
      ))}
    </Surface>
  );
}
