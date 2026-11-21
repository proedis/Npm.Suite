import * as React from 'react';

import { Truck } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { Badge } from '@proedis/ui/display/badge';
import { Heading } from '@proedis/ui/display/heading';
import { IconBox } from '@proedis/ui/display/icon-box';
import { Item } from '@proedis/ui/display/item';
import { Stack } from '@proedis/ui/layout';


function Card(props: { caption: string }): React.ReactNode {
  return (
    <Stack gap={4} className={'rounded-xl border border-border bg-background p-5 text-foreground'}>
      <p className={'text-xs text-muted-foreground'}>{props.caption}</p>
      <Item>
        <IconBox fill={'soft'} tone={'primary'}><Truck /></IconBox>
        <Heading>
          <Heading.Title>FT-234-KL</Heading.Title>
          <Heading.Description>Last stop 12:04</Heading.Description>
        </Heading>
        <Item.Actions>
          <Badge fill={'soft'} tone={'success'} dot>In service</Badge>
        </Item.Actions>
      </Item>
      <Button fill={'soft'} block>Open the route</Button>
    </Stack>
  );
}


export default function Example(): React.ReactNode {
  return (
    <Stack columns={{ base: 1, md: 2 }} gap={4} className={'w-full'}>
      <Card caption={'Follows the page'} />

      {/* The class on any ancestor switches the subtree: the tokens and the dark: variant both read it */}
      <Stack gap={0} className={'dark'}>
        <Card caption={'Always dark: className="dark" on a wrapper'} />
      </Stack>
    </Stack>
  );
}
