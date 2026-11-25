import * as React from 'react';

import { Route } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { Heading } from '@proedis/ui/display/heading';
import { IconBox } from '@proedis/ui/display/icon-box';
import { Item } from '@proedis/ui/display/item';


/** The same three slots on the other axis: the shape of an empty state */
export default function Example(): React.ReactNode {
  return (
    <Item direction={'vertical'} gap={5} className={'max-w-sm text-center'}>
      <IconBox size={'xl'} tone={'primary'} halo><Route /></IconBox>
      <Heading size={'lg'} gap={1.5}>
        <Heading.Title>No round yet</Heading.Title>
        <Heading.Description>A round groups the stops a vehicle covers in one shift.</Heading.Description>
      </Heading>
      <Item.Actions>
        <Button>Plan a round</Button>
      </Item.Actions>
    </Item>
  );
}
