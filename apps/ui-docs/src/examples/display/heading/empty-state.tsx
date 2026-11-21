import * as React from 'react';

import { Inbox } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { Heading } from '@proedis/ui/display/heading';
import { IconBox } from '@proedis/ui/display/icon-box';
import { Item } from '@proedis/ui/display/item';


export default function Example(): React.ReactNode {
  return (
    <Item direction={'vertical'} gap={6} className={'max-w-sm py-6 text-center'}>
      <IconBox size={'2xl'} tone={'primary'} halo><Inbox /></IconBox>
      <Heading gap={2}>
        <Heading.Title size={'xl'}>No results</Heading.Title>
        <Heading.Description size={'md'} lines={2}>Try removing a filter, or search the archived orders too.</Heading.Description>
      </Heading>
      <Item.Actions>
        <Button fill={'soft'}>Clear the filters</Button>
      </Item.Actions>
    </Item>
  );
}
