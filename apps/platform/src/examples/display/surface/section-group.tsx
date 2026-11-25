import * as React from 'react';

import { Heading } from '@proedis/ui/display/heading';
import { Item } from '@proedis/ui/display/item';
import { LabeledContent } from '@proedis/ui/display/labeled-content';
import { Surface } from '@proedis/ui/display/surface';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Surface className={'w-full max-w-lg'}>
      <Surface.Header>
        <Item.Heading size={'lg'}>
          <Heading.Title>Vehicle FT-234-KL</Heading.Title>
          <Heading.Description>Compactor, Chieri depot</Heading.Description>
        </Item.Heading>
      </Surface.Header>

      {/* A line between the sections of the group, room on both sides of it */}
      <Surface.SectionGroup divided>
        <Surface.Section>
          <Stack columns={2} gap={'md'}>
            <LabeledContent>
              <LabeledContent.Label>Capacity</LabeledContent.Label>
              <LabeledContent.Value>18 t</LabeledContent.Value>
            </LabeledContent>
            <LabeledContent>
              <LabeledContent.Label>Kilometres</LabeledContent.Label>
              <LabeledContent.Value>142,380</LabeledContent.Value>
            </LabeledContent>
          </Stack>
        </Surface.Section>

        {/* Side by side, the line between them vertical */}
        <Surface.SectionGroup divided direction={'horizontal'}>
          <Surface.Section className={'grow'}>
            <LabeledContent>
              <LabeledContent.Label>Next service</LabeledContent.Label>
              <LabeledContent.Value>In 1,200 km</LabeledContent.Value>
            </LabeledContent>
          </Surface.Section>
          <Surface.Section className={'grow'}>
            <LabeledContent>
              <LabeledContent.Label>Inspection</LabeledContent.Label>
              <LabeledContent.Value>March 2027</LabeledContent.Value>
            </LabeledContent>
          </Surface.Section>
        </Surface.SectionGroup>
      </Surface.SectionGroup>
    </Surface>
  );
}
