import * as React from 'react';

import { BookOpen, Compass, Ellipsis } from 'lucide-react';

import { IconButton } from '@proedis/ui/actions/button';
import { Menu } from '@proedis/ui/actions/menu';


export default function Example(): React.ReactNode {
  return (
    <Menu
      aria-label={'Go to a page of the documentation'}
      trigger={<IconButton label={'Pages'} icon={<Ellipsis />} />}
    >
      <Menu.Item icon={<Compass />} to={'/ui'}>Overview</Menu.Item>
      <Menu.Item icon={<BookOpen />} to={'/ui/actions/button'}>Button</Menu.Item>
    </Menu>
  );
}
