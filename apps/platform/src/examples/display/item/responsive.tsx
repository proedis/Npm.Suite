import * as React from 'react';

import { Truck } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { Heading } from '@proedis/ui/display/heading';
import { IconBox } from '@proedis/ui/display/icon-box';
import { Item } from '@proedis/ui/display/item';


/** A column on a phone, a row from sm: direction and align take one value per breakpoint */
export default function Example(): React.ReactNode {
  return (
    <Item
      direction={{ base: 'vertical', sm: 'horizontal' }}
      align={{ base: 'start', sm: 'center' }}
      className={'w-full max-w-lg rounded-xl border border-border p-4'}
    >
      <Item.Icon><IconBox tone={'primary'}><Truck /></IconBox></Item.Icon>
      <Item.Heading>
        <Heading.Title>FT-234-KL needs a service</Heading.Title>
        <Heading.Description>The last one was 14,800 km ago</Heading.Description>
      </Item.Heading>
      <Item.Actions>
        <Button size={'sm'} fill={'plain'} tone={'muted'}>Later</Button>
        <Button size={'sm'}>Book it</Button>
      </Item.Actions>
    </Item>
  );
}
