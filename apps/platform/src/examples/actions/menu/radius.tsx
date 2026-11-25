import * as React from 'react';

import { Copy, Ellipsis, Pencil, Trash2 } from 'lucide-react';

import { IconButton } from '@proedis/ui/actions/button';
import { Menu } from '@proedis/ui/actions/menu';
import { Cluster } from '@proedis/ui/layout';

import type { MenuRadius } from '@proedis/ui/actions/menu';


const RADII: readonly MenuRadius[] = [ 'none', 'default', 'xl' ];


/** The items sit 4px inside the panel and take its corner less those 4px: the two stay concentric */
export default function Example(): React.ReactNode {
  return (
    <Cluster gap={'md'}>
      {RADII.map((radius) => (
        <Menu
          key={radius}
          radius={radius}
          aria-label={`Actions, radius ${radius}`}
          trigger={<IconButton label={`radius="${radius}"`} icon={<Ellipsis />} />}
        >
          <Menu.Item icon={<Pencil />}>Edit</Menu.Item>
          <Menu.Item icon={<Copy />}>Duplicate</Menu.Item>
          <Menu.Separator />
          <Menu.Item icon={<Trash2 />} tone={'destructive'}>Delete</Menu.Item>
        </Menu>
      ))}
    </Cluster>
  );
}
