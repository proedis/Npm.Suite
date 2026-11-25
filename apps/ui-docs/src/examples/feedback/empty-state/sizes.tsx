import * as React from 'react';

import { CircleAlert, Plus, Search, Truck } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { Surface } from '@proedis/ui/display/surface';
import { EmptyState } from '@proedis/ui/feedback/empty-state';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={'lg'} className={'w-full'}>
      {/* page: the whole area, its title a heading of the page */}
      <Surface>
        <EmptyState size={'page'} tone={'primary'}>
          <EmptyState.Icon><Truck /></EmptyState.Icon>
          <EmptyState.Title as={'h2'}>No vehicle yet</EmptyState.Title>
          <EmptyState.Description>Add the first vehicle of the fleet to plan its rounds.</EmptyState.Description>
          <EmptyState.Actions><Button leading={<Plus />}>Add a vehicle</Button></EmptyState.Actions>
        </EmptyState>
      </Surface>

      {/* panel, the default: a card, a tab, a list inside a page */}
      <Surface>
        <EmptyState tone={'primary'}>
          <EmptyState.Icon><Truck /></EmptyState.Icon>
          <EmptyState.Title>No vehicle yet</EmptyState.Title>
          <EmptyState.Description>Add the first vehicle of the fleet.</EmptyState.Description>
          <EmptyState.Actions><Button size={'sm'} fill={'soft'} leading={<Plus />}>Add a vehicle</Button></EmptyState.Actions>
        </EmptyState>
      </Surface>

      {/* inline: a line of text, in a field or under a list; the description and the actions are not drawn */}
      <Surface>
        <Surface.Section>
          <Stack gap={'xs'}>
            <EmptyState size={'inline'}>
              <EmptyState.Icon><Search /></EmptyState.Icon>
              <EmptyState.Title>No driver matches “Bian”</EmptyState.Title>
            </EmptyState>
            <EmptyState size={'inline'} tone={'destructive'}>
              <EmptyState.Icon><CircleAlert /></EmptyState.Icon>
              <EmptyState.Title>The drivers did not load</EmptyState.Title>
            </EmptyState>
          </Stack>
        </Surface.Section>
      </Surface>
    </Stack>
  );
}
