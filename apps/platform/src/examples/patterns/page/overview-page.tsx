import * as React from 'react';

import { ChevronRight, Download, Plus } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { Badge } from '@proedis/ui/display/badge';
import { Heading } from '@proedis/ui/display/heading';
import { Item } from '@proedis/ui/display/item';
import { LabeledContent } from '@proedis/ui/display/labeled-content';
import { Surface } from '@proedis/ui/display/surface';
import { Stack } from '@proedis/ui/layout';


const FIGURES = [ [ 'Stops', '1,204' ], [ 'Kilometres', '3,880' ], [ 'Tonnes', '92.4' ] ] as const;

const ROUNDS = [
  { code: 'RD-24017', place: 'Borgo Po, morning shift', state: 'Running', tone: 'info' },
  { code: 'RD-24018', place: 'Chieri centre, morning shift', state: 'Planned', tone: 'primary' },
  { code: 'RD-24019', place: 'Pino Torinese, afternoon shift', state: 'Late', tone: 'warning' }
] as const;


/** A page of a section: its header, three figures, the list it is about */
export default function Example(): React.ReactNode {
  return (
    <Stack gap={'lg'} className={'w-full'}>
      <Stack direction={{ base: 'vertical', md: 'horizontal' }} align={{ base: 'stretch', md: 'end' }} justify={'between'} gap={'md'}>
        <Heading size={'lg'}>
          <Heading.Title as={'h2'}>Collection rounds</Heading.Title>
          <Heading.Description>38 rounds this week, 4 still to assign</Heading.Description>
        </Heading>
        <Stack direction={'horizontal'} gap={'xs'}>
          <Button fill={'soft'} tone={'secondary'} leading={<Download />}>Export</Button>
          <Button leading={<Plus />}>New round</Button>
        </Stack>
      </Stack>

      <Stack columns={{ base: 1, sm: 3 }} gap={'md'}>
        {FIGURES.map(([ label, value ]) => (
          <Surface key={label}>
            <Surface.Section>
              <LabeledContent>
                <LabeledContent.Label>{label}</LabeledContent.Label>
                <LabeledContent.Value className={'tabular-nums'}>{value}</LabeledContent.Value>
              </LabeledContent>
            </Surface.Section>
          </Surface>
        ))}
      </Stack>

      <Surface>
        <Surface.Header>
          <Item.Heading>
            <Heading.Title as={'h3'}>Today</Heading.Title>
          </Item.Heading>
        </Surface.Header>
        <Stack gap={0} as={'ul'} divided>
          {ROUNDS.map((round) => (
            <li key={round.code}>
              <Item as={'button'} type={'button'} interactive inset className={'w-full text-start'}>
                <Item.Heading>
                  <Heading.Title>{round.code}</Heading.Title>
                  <Heading.Description>{round.place}</Heading.Description>
                </Item.Heading>
                <Badge tone={round.tone}>{round.state}</Badge>
                <Item.Trailing><ChevronRight className={'size-4'} /></Item.Trailing>
              </Item>
            </li>
          ))}
        </Stack>
      </Surface>
    </Stack>
  );
}
