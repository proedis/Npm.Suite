import * as React from 'react';

import { ArrowLeft, CircleAlert, FileQuestion, Filter, Plus, Search, Truck, X } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { Surface } from '@proedis/ui/display/surface';
import { EmptyState } from '@proedis/ui/feedback/empty-state';
import { Stack } from '@proedis/ui/layout';


/**
 * Five cases, five recipes: the tone says what happened, the actions are the Buttons the case needs. An
 * application writes these once, as components of its own, and reuses them
 */
export default function Example(): React.ReactNode {
  return (
    <Stack columns={{ base: 1, md: 2 }} gap={'md'} className={'w-full'}>
      <Surface>
        <EmptyState tone={'primary'}>
          <EmptyState.Icon><Truck /></EmptyState.Icon>
          <EmptyState.Title>No vehicle yet</EmptyState.Title>
          <EmptyState.Description>Add the first vehicle of the fleet to plan its rounds.</EmptyState.Description>
          <EmptyState.Actions><Button size={'sm'} fill={'soft'} leading={<Plus />}>Add a vehicle</Button></EmptyState.Actions>
        </EmptyState>
      </Surface>

      <Surface>
        <EmptyState>
          <EmptyState.Icon><Search /></EmptyState.Icon>
          <EmptyState.Title>No stop for “via rma”</EmptyState.Title>
          <EmptyState.Description>Check the spelling or clear the filters.</EmptyState.Description>
          <EmptyState.Actions>
            <Button size={'sm'} fill={'plain'} tone={'destructive'} leading={<X />}>Clear filters</Button>
          </EmptyState.Actions>
        </EmptyState>
      </Surface>

      <Surface>
        <EmptyState tone={'destructive'}>
          <EmptyState.Icon><CircleAlert /></EmptyState.Icon>
          <EmptyState.Title>The rounds did not load</EmptyState.Title>
          <EmptyState.Description>The server did not answer. Your data is safe.</EmptyState.Description>
          <EmptyState.Actions><Button size={'sm'} tone={'muted'}>Try again</Button></EmptyState.Actions>
        </EmptyState>
      </Surface>

      <Surface>
        <EmptyState>
          <EmptyState.Icon><FileQuestion /></EmptyState.Icon>
          <EmptyState.Title>Order 2024-118 is not there</EmptyState.Title>
          <EmptyState.Description>It may have been deleted, or the link is wrong.</EmptyState.Description>
          <EmptyState.Actions>
            <Button size={'sm'} tone={'muted'} leading={<ArrowLeft />} to={'/'}>Back to the orders</Button>
          </EmptyState.Actions>
        </EmptyState>
      </Surface>

      <Surface>
        <EmptyState tone={'warning'}>
          <EmptyState.Icon><Filter /></EmptyState.Icon>
          <EmptyState.Title>This view needs a district</EmptyState.Title>
          <EmptyState.Description>Choose a district in the filters to see its rounds.</EmptyState.Description>
        </EmptyState>
      </Surface>
    </Stack>
  );
}
