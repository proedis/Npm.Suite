import * as React from 'react';

import { Truck } from 'lucide-react';

import { IconBox } from '@proedis/ui/display/icon-box';
import { Item } from '@proedis/ui/display/item';
import { Heading } from '@proedis/ui/display/heading';
import { Stack } from '@proedis/ui/layout';
import { Skeleton } from '@proedis/ui/primitives';


/** Three rows loading under the row they stand for */
export default function Example(): React.ReactNode {
  return (
    <Stack gap={0} divided className={'w-full max-w-md rounded-xl border border-border bg-card'}>
      <Item className={'px-4 py-3'}>
        <Item.Icon><IconBox size={'sm'} fill={'soft'} tone={'primary'}><Truck /></IconBox></Item.Icon>
        <Item.Heading>
          <Heading.Title>FT-234-KL</Heading.Title>
          <Heading.Description>Route 12, last stop at 12:04</Heading.Description>
        </Item.Heading>
      </Item>
      {[ 1, 2, 3 ].map((row) => <Skeleton key={row} shape={'item'} className={'px-4 py-3'} />)}
    </Stack>
  );
}
