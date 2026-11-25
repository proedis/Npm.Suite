import * as React from 'react';

import { Archive, ChevronDown, Pencil, Send } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { Menu } from '@proedis/ui/actions/menu';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  const [ last, setLast ] = React.useState<string>('Nothing chosen yet');

  return (
    <Stack align={'center'} gap={3}>
      <Menu
        aria-label={'Actions on order 2024-118'}
        align={'start'}
        trigger={<Button fill={'soft'} tone={'secondary'} trailing={<ChevronDown />}>Actions</Button>}
      >
        <Menu.Item icon={<Pencil />} onSelect={() => setLast('Edit')}>Edit</Menu.Item>
        <Menu.Item icon={<Send />} onSelect={() => setLast('Send to the customer')}>Send to the customer</Menu.Item>
        <Menu.Item
          icon={<Archive />}
          disabled
          description={'Only a closed order can be archived'}
        >
          Archive
        </Menu.Item>
      </Menu>
      <p className={'text-sm text-muted-foreground'}>{last}</p>
    </Stack>
  );
}
