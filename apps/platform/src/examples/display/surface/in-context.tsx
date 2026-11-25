import * as React from 'react';

import { Ellipsis, Truck } from 'lucide-react';

import { Button, IconButton } from '@proedis/ui/actions/button';
import { Badge } from '@proedis/ui/display/badge';
import { Heading } from '@proedis/ui/display/heading';
import { IconBox } from '@proedis/ui/display/icon-box';
import { Item } from '@proedis/ui/display/item';
import { LabeledContent } from '@proedis/ui/display/labeled-content';
import { Surface } from '@proedis/ui/display/surface';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Surface as={'article'} aria-labelledby={'vehicle-card'} className={'w-full max-w-lg'}>
      <Surface.Header>
        <Item.Icon><IconBox tone={'primary'}><Truck /></IconBox></Item.Icon>
        <Item.Heading size={'lg'}>
          <Stack direction={'horizontal'} align={'center'} gap={2}>
            <Heading.Title as={'h3'} id={'vehicle-card'} lines={1}>FT-234-KL</Heading.Title>
            <Badge tone={'success'} dot>In service</Badge>
          </Stack>
          <Heading.Description>Compactor, round 14, north district</Heading.Description>
        </Item.Heading>
        <Item.Actions>
          <IconButton label={'More actions on FT-234-KL'} icon={<Ellipsis />} />
        </Item.Actions>
      </Surface.Header>
      <Surface.Section>
        <Stack columns={{ base: 2, sm: 3 }} gap={5}>
          <LabeledContent>
            <LabeledContent.Label>Driver</LabeledContent.Label>
            <LabeledContent.Value>Rossi Mario</LabeledContent.Value>
          </LabeledContent>
          <LabeledContent>
            <LabeledContent.Label>Stops</LabeledContent.Label>
            <LabeledContent.Value>29 of 38</LabeledContent.Value>
          </LabeledContent>
          <LabeledContent>
            <LabeledContent.Label>Last stop</LabeledContent.Label>
            <LabeledContent.Value>12:04</LabeledContent.Value>
          </LabeledContent>
        </Stack>
      </Surface.Section>
      <Surface.Footer muted justify={'between'}>
        <span className={'text-xs'}>Updated two minutes ago</span>
        <Button size={'sm'} fill={'soft'}>Open the round</Button>
      </Surface.Footer>
    </Surface>
  );
}
