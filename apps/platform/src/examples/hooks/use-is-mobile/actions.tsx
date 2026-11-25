import * as React from 'react';

import { Archive, Copy, Ellipsis, Pencil, Printer } from 'lucide-react';

import { Button, IconButton } from '@proedis/ui/actions/button';
import { Menu } from '@proedis/ui/actions/menu';
import { useIsMobile } from '@proedis/ui/hooks';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  const isMobile = useIsMobile();

  /* Below md the secondary actions go behind a menu: one subtree or the other, never both mounted */
  return (
    <Stack direction={'horizontal'} align={'center'} gap={2}>
      <Button leading={<Pencil />}>Edit order</Button>
      {isMobile
        ? (
          <Menu aria-label={'More actions on order 2026/1184'} trigger={<IconButton label={'More actions'} icon={<Ellipsis />} />}>
            <Menu.Item icon={<Copy />}>Duplicate</Menu.Item>
            <Menu.Item icon={<Printer />}>Print</Menu.Item>
            <Menu.Item icon={<Archive />}>Archive</Menu.Item>
          </Menu>
        )
        : (
          <React.Fragment>
            <Button fill={'soft'} tone={'secondary'} leading={<Copy />}>Duplicate</Button>
            <Button fill={'soft'} tone={'secondary'} leading={<Printer />}>Print</Button>
            <Button fill={'plain'} leading={<Archive />}>Archive</Button>
          </React.Fragment>
        )}
    </Stack>
  );
}
