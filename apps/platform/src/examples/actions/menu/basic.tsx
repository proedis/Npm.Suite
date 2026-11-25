import * as React from 'react';

import { Copy, Ellipsis, Pencil, Trash2 } from 'lucide-react';

import { IconButton } from '@proedis/ui/actions/button';
import { Menu } from '@proedis/ui/actions/menu';


export default function Example(): React.ReactNode {
  return (
    <Menu
      aria-label={'Actions on route R-14'}
      trigger={<IconButton label={'Actions'} icon={<Ellipsis />} />}
    >
      <Menu.Item icon={<Pencil />}>Edit</Menu.Item>
      <Menu.Item icon={<Copy />}>Duplicate</Menu.Item>
      <Menu.Separator />
      <Menu.Item icon={<Trash2 />} tone={'destructive'}>Delete</Menu.Item>
    </Menu>
  );
}
