import * as React from 'react';

import { CalendarClock, MapPin, Truck } from 'lucide-react';

import { Heading } from '@proedis/ui/display/heading';
import { IconBox } from '@proedis/ui/display/icon-box';
import { Item } from '@proedis/ui/display/item';
import { Stack } from '@proedis/ui/layout';


/** plain keeps the footprint, so a column of rows stays aligned with or without a surface */
export default function Example(): React.ReactNode {
  return (
    <Stack gap={4} className={'w-full max-w-sm'}>
      <Item>
        <Item.Icon><IconBox tone={'primary'}><Truck /></IconBox></Item.Icon>
        <Item.Heading>
          <Heading.Title>FT-234-KL</Heading.Title>
          <Heading.Description>Compactor, 18 t</Heading.Description>
        </Item.Heading>
      </Item>
      <Item>
        <Item.Icon><IconBox fill={'plain'}><MapPin /></IconBox></Item.Icon>
        <Item.Heading>
          <Heading.Title>North district</Heading.Title>
          <Heading.Description>38 stops</Heading.Description>
        </Item.Heading>
      </Item>
      <Item>
        <Item.Icon><IconBox fill={'plain'}><CalendarClock /></IconBox></Item.Icon>
        <Item.Heading>
          <Heading.Title>Monday, 07:00</Heading.Title>
          <Heading.Description>Weekly</Heading.Description>
        </Item.Heading>
      </Item>
    </Stack>
  );
}
