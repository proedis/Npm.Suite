import * as React from 'react';

import { Item } from '@proedis/ui/display/item';
import { Surface } from '@proedis/ui/display/surface';
import { useBreakpoint } from '@proedis/ui/hooks';
import { Split, Stack } from '@proedis/ui/layout';


const ROUTES = [ 'R-12 · Monday', 'R-14 · Monday', 'R-21 · Tuesday', 'R-30 · Thursday' ];


export default function Example(): React.ReactNode {
  const [ selected, setSelected ] = React.useState(ROUTES[1]);
  const isWide = useBreakpoint('lg');

  const list = (
    <Stack gap={1}>
      {ROUTES.map((route) => (
        <Item
          key={route}
          as={'button'}
          type={'button'}
          interactive
          inset
          aria-current={route === selected || undefined}
          className={'rounded-md text-start aria-[current=true]:bg-muted aria-[current=true]:font-medium'}
          onClick={() => setSelected(route)}
        >
          {route}
        </Item>
      ))}
    </Stack>
  );

  const detail = <Surface className={'border border-border p-6'}>The stops of {selected}</Surface>;

  /* Two different trees, not one tree hidden by CSS: below lg the list alone, a tap opens the detail elsewhere */
  return (
    <div className={'w-full'}>
      {isWide ? <Split rail={list} railWidth={200} gap={6}>{detail}</Split> : list}
    </div>
  );
}
