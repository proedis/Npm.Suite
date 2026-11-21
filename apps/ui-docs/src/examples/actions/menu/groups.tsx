import * as React from 'react';

import { Ellipsis, FileText, MapPin, Truck, UserRound } from 'lucide-react';

import { IconButton } from '@proedis/ui/actions/button';
import { Menu } from '@proedis/ui/actions/menu';


export default function Example(): React.ReactNode {
  return (
    <Menu
      aria-label={'Actions on stop 12'}
      trigger={<IconButton label={'Actions'} icon={<Ellipsis />} />}
    >
      <Menu.Group label={'The stop'}>
        <Menu.Item icon={<MapPin />}>Show on the map</Menu.Item>
        <Menu.Item icon={<FileText />}>Open the contract</Menu.Item>
      </Menu.Group>
      <Menu.Separator />
      <Menu.Group label={'The round'}>
        <Menu.Item icon={<Truck />}>Change vehicle</Menu.Item>
        <Menu.Item icon={<UserRound />}>Change crew</Menu.Item>
      </Menu.Group>
    </Menu>
  );
}
