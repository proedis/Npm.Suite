import * as React from 'react';

import { Pencil } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { Detail } from '@proedis/ui/data/detail';
import { Badge } from '@proedis/ui/display/badge';
import { Heading } from '@proedis/ui/display/heading';
import { Item } from '@proedis/ui/display/item';
import { Surface } from '@proedis/ui/display/surface';

import { detailLabels } from '../labels';


export default function Example(): React.ReactNode {
  return (
    <Surface className={'w-full'}>
      {/* The header and the body in a divided group: a line between them, room on both sides */}
      <Surface.SectionGroup divided>
        <Surface.Header inset>
          <Item.Heading>
            <Heading.Title>RD-24017</Heading.Title>
            <Heading.Description>Collection round, Borgo Po</Heading.Description>
          </Item.Heading>
          <Item.Actions>
            <Badge dot tone={'info'}>Running</Badge>
            <Button fill={'soft'} size={'sm'} leading={<Pencil />}>Edit</Button>
          </Item.Actions>
        </Surface.Header>

        <Surface.Section>
          {/* The detail is a content, not a container: the card, a drawer or a page around it is the caller's */}
          <Detail labels={detailLabels}>
            <Detail.Section title={'Planning'} headingLevel={4}>
              <Detail.Grid>
                <Detail.Item label={'Date'} type={'date'}>16/11/2026</Detail.Item>
                <Detail.Item label={'Shift'} type={'choice'}>Morning</Detail.Item>
                <Detail.Item label={'Stops'} type={'number'}>38</Detail.Item>
                <Detail.Item label={'Driver'} type={'person'}>Rossi Anna</Detail.Item>
                <Detail.Item label={'Vehicle'} type={'text-code'} copyable>FA-644-DM</Detail.Item>
              </Detail.Grid>
            </Detail.Section>

            <Detail.Section title={'Outcome'} headingLevel={4}>
              <Detail.Grid>
                <Detail.Item label={'Left the depot'} type={'date'}>06:10</Detail.Item>
                <Detail.Item label={'Collected'} type={'number'}>6,460 kg</Detail.Item>
                <Detail.Item label={'Missed stops'} type={'number'}>{null}</Detail.Item>
                <Detail.Item label={'Notes'} type={'paragraph'}>Via Moncalvo closed for works: stops 12 to 15 reached from Corso Casale.</Detail.Item>
              </Detail.Grid>
            </Detail.Section>
          </Detail>
        </Surface.Section>
      </Surface.SectionGroup>
    </Surface>
  );
}
