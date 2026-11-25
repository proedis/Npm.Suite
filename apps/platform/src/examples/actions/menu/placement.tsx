import * as React from 'react';

import { ChevronDown, ChevronUp } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { Menu } from '@proedis/ui/actions/menu';
import { Cluster } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Cluster gap={3}>
      <Menu
        aria-label={'Bottom, start'}
        align={'start'}
        trigger={<Button fill={'soft'} tone={'secondary'} trailing={<ChevronDown />}>Bottom, start</Button>}
      >
        <Menu.Item>Lines up with the left edge</Menu.Item>
      </Menu>
      <Menu
        aria-label={'Bottom, end'}
        trigger={<Button fill={'soft'} tone={'secondary'} trailing={<ChevronDown />}>Bottom, end</Button>}
      >
        <Menu.Item>Lines up with the right edge</Menu.Item>
      </Menu>
      <Menu
        aria-label={'Top, start'}
        side={'top'}
        align={'start'}
        trigger={<Button fill={'soft'} tone={'secondary'} trailing={<ChevronUp />}>Top, start</Button>}
      >
        <Menu.Item>Opens above the button</Menu.Item>
      </Menu>
    </Cluster>
  );
}
