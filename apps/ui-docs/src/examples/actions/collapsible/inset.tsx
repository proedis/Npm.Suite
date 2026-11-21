import * as React from 'react';

import { CollapsibleSection } from '@proedis/ui/actions/collapsible';
import { Heading } from '@proedis/ui/display/heading';
import { Surface } from '@proedis/ui/display/surface';


export default function Example(): React.ReactNode {
  return (
    <Surface className={'w-full max-w-lg border border-border'}>
      <Surface.Header inset>
        <Heading>
          <Heading.Title>Permissions</Heading.Title>
          <Heading.Description>What the dispatchers of the north depot can do</Heading.Description>
        </Heading>
      </Surface.Header>

      <CollapsibleSection inset defaultOpen title={'Routes'} meta={'3 of 4'}>
        <p className={'px-6 pb-4 text-sm text-muted-foreground'}>Read, create and assign routes. Archiving is off.</p>
      </CollapsibleSection>
      <CollapsibleSection inset title={'Vehicles'} meta={'1 of 4'}>
        <p className={'px-6 pb-4 text-sm text-muted-foreground'}>Read only.</p>
      </CollapsibleSection>
    </Surface>
  );
}
