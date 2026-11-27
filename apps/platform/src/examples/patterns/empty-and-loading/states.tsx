import * as React from 'react';

import { Plus, Truck } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { SegmentedControl } from '@proedis/ui/actions/segmented-control';
import { Heading } from '@proedis/ui/display/heading';
import { IconBox } from '@proedis/ui/display/icon-box';
import { Item } from '@proedis/ui/display/item';
import { Surface } from '@proedis/ui/display/surface';
import { EmptyState } from '@proedis/ui/feedback/empty-state';
import { Stack } from '@proedis/ui/layout';
import { Skeleton } from '@proedis/ui/primitives';


type ListState = 'loading' | 'empty' | 'loaded';

const VEHICLES = [ 'FT-234-KL', 'GH-118-PL', 'AB-901-CD' ];


/**
 * One list, its three states. The frame stays: header and actions are there while the rows load, and the
 * empty state takes the place of the rows, not of the card.
 */
export default function Example(): React.ReactNode {
  const [ state, setState ] = React.useState<ListState>('loading');

  return (
    <Stack gap={'md'} align={'center'} className={'w-full'}>
      <SegmentedControl aria-label={'State of the list'} value={state} onValueChange={(next) => setState(next as ListState)}>
        <SegmentedControl.Item value={'loading'}>Loading</SegmentedControl.Item>
        <SegmentedControl.Item value={'empty'}>Empty</SegmentedControl.Item>
        <SegmentedControl.Item value={'loaded'}>Loaded</SegmentedControl.Item>
      </SegmentedControl>

      <Surface className={'w-full max-w-md'}>
        <Surface.Header>
          <Item.Heading>
            <Heading.Title as={'h3'}>Vehicles</Heading.Title>
            <Heading.Description>South depot</Heading.Description>
          </Item.Heading>
          <Item.Actions>
            <Button size={'sm'} leading={<Plus />}>New vehicle</Button>
          </Item.Actions>
        </Surface.Header>

        {state === 'loading' && (
          <Stack gap={0} divided aria-busy>
            {[ 1, 2, 3 ].map((row) => <Skeleton key={row} shape={'item'} className={'px-4 py-3'} />)}
          </Stack>
        )}

        {state === 'empty' && (
          <EmptyState>
            <EmptyState.Icon><Truck /></EmptyState.Icon>
            <EmptyState.Title>No vehicle in this depot yet</EmptyState.Title>
            <EmptyState.Description>Add the first one, or move one here from another depot.</EmptyState.Description>
            <EmptyState.Actions>
              <Button size={'sm'} fill={'soft'} leading={<Plus />}>New vehicle</Button>
            </EmptyState.Actions>
          </EmptyState>
        )}

        {state === 'loaded' && (
          <Stack gap={0} as={'ul'} divided>
            {VEHICLES.map((plate) => (
              <li key={plate}>
                <Item inset>
                  <Item.Icon><IconBox size={'sm'} fill={'soft'} tone={'secondary'}><Truck /></IconBox></Item.Icon>
                  <Item.Heading>
                    <Heading.Title>{plate}</Heading.Title>
                  </Item.Heading>
                </Item>
              </li>
            ))}
          </Stack>
        )}
      </Surface>
    </Stack>
  );
}
