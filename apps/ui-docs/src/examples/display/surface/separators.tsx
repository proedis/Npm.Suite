import * as React from 'react';

import { Heading } from '@proedis/ui/display/heading';
import { LabeledContent } from '@proedis/ui/display/labeled-content';
import { Surface } from '@proedis/ui/display/surface';
import { Stack } from '@proedis/ui/layout';


/** A line where the content changes subject, room where it only takes a breath */
export default function Example(): React.ReactNode {
  return (
    <Surface className={'w-full max-w-md'}>
      <Surface.Header>
        <Heading>
          <Heading.Title size={'lg'}>Vehicle FT-234-KL</Heading.Title>
          <Heading.Description>Compactor, Chieri depot</Heading.Description>
        </Heading>
      </Surface.Header>
      <Surface.Separator />
      <Surface.Section>
        <Stack columns={2} gap={4}>
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
      <Surface.Separator type={'gap'} space={2} />
      <Surface.Section className={'pt-0'}>
        <p className={'text-sm text-muted-foreground'}>Next service in 1,200 km.</p>
      </Surface.Section>
    </Surface>
  );
}
