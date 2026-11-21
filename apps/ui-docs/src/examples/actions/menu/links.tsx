import * as React from 'react';

import { useNavigate } from '@tanstack/react-router';
import { BookOpen, Compass, Ellipsis } from 'lucide-react';

import { IconButton } from '@proedis/ui/actions/button';
import { Menu } from '@proedis/ui/actions/menu';

import type { LinkTarget } from '@proedis/ui/core';


export default function Example(): React.ReactNode {
  const navigate = useNavigate();

  /** The application's navigation, handed over as an address and a way to go there */
  const linkTo = (to: string): LinkTarget => ({
    href: to,
    go  : () => {
      navigate({ to }).catch(() => undefined);
    }
  });

  return (
    <Menu
      aria-label={'Go to a page of the documentation'}
      trigger={<IconButton label={'Pages'} icon={<Ellipsis />} />}
    >
      <Menu.Item icon={<Compass />} to={linkTo('/')}>Overview</Menu.Item>
      <Menu.Item icon={<BookOpen />} to={linkTo('/actions/button')}>Button</Menu.Item>
    </Menu>
  );
}
