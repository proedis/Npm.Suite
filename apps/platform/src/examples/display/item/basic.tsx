import * as React from 'react';

import { ChevronRight, Pencil, Truck } from 'lucide-react';

import { IconButton } from '@proedis/ui/actions/button';
import { Heading } from '@proedis/ui/display/heading';
import { IconBox } from '@proedis/ui/display/icon-box';
import { Item } from '@proedis/ui/display/item';


export default function Example(): React.ReactNode {
  return (
    <Item className={'w-full max-w-md'}>
      <Item.Icon><IconBox tone={'primary'}><Truck /></IconBox></Item.Icon>
      <Item.Heading>
        <Heading.Eyebrow>In service</Heading.Eyebrow>
        <Heading.Title>FT-234-KL</Heading.Title>
        <Heading.Description>Last stop 12:04</Heading.Description>
      </Item.Heading>
      <Item.Actions>
        <IconButton label={'Edit FT-234-KL'} icon={<Pencil />} />
      </Item.Actions>
      <Item.Trailing><ChevronRight className={'size-4'} /></Item.Trailing>
    </Item>
  );
}
