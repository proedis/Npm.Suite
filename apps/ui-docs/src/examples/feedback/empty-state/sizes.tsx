import * as React from 'react';

import { Plus, Truck } from 'lucide-react';

import { EmptyState } from '@proedis/ui/feedback/empty-state';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={6} className={'w-full'}>
      {/* page: the whole area, its title a heading of the page */}
      <EmptyState
        size={'page'}
        headingLevel={2}
        kind={'first-use'}
        icon={<Truck />}
        title={'No vehicle yet'}
        description={'Add the first vehicle of the fleet to plan its rounds.'}
        actions={[ { role: 'create', label: 'Add a vehicle', icon: <Plus />, onClick: () => undefined } ]}
        className={'rounded-xl border border-border'}
      />

      {/* panel, the default: a card, a tab, a list inside a page */}
      <EmptyState
        kind={'first-use'}
        icon={<Truck />}
        title={'No vehicle yet'}
        description={'Add the first vehicle of the fleet.'}
        actions={[ { role: 'create', label: 'Add a vehicle', icon: <Plus />, onClick: () => undefined } ]}
        className={'rounded-xl border border-border'}
      />

      {/* inline: a line of text, in a field or under a list */}
      <Stack gap={2} className={'rounded-xl border border-border p-4'}>
        <EmptyState size={'inline'} kind={'no-results'} title={'No driver matches “Bian”'} />
        <EmptyState size={'inline'} kind={'error'} title={'The drivers did not load'} />
      </Stack>
    </Stack>
  );
}
