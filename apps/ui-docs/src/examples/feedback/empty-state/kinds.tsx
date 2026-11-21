import * as React from 'react';

import { CircleAlert, FileQuestion, Filter, Search, Truck } from 'lucide-react';

import { EmptyState } from '@proedis/ui/feedback/empty-state';
import { Stack } from '@proedis/ui/layout';


/** The case fixes the tone of the box and the look of each action */
export default function Example(): React.ReactNode {
  return (
    <Stack columns={{ base: 1, md: 2 }} gap={4} className={'w-full'}>
      <EmptyState
        kind={'first-use'}
        icon={<Truck />}
        title={'No vehicle yet'}
        description={'Add the first vehicle of the fleet to plan its rounds.'}
        actions={[ { role: 'create', label: 'Add a vehicle', onClick: () => undefined } ]}
        className={'rounded-xl border border-border'}
      />
      <EmptyState
        kind={'no-results'}
        icon={<Search />}
        title={'No stop for “via rma”'}
        description={'Check the spelling or clear the filters.'}
        actions={[ { role: 'clear', label: 'Clear filters', onClick: () => undefined } ]}
        className={'rounded-xl border border-border'}
      />
      <EmptyState
        kind={'error'}
        icon={<CircleAlert />}
        title={'The rounds did not load'}
        description={'The server did not answer. Your data is safe.'}
        actions={[ { role: 'retry', label: 'Try again', onClick: () => undefined } ]}
        className={'rounded-xl border border-border'}
      />
      <EmptyState
        kind={'not-found'}
        icon={<FileQuestion />}
        title={'Order 2024-118 is not there'}
        description={'It may have been deleted, or the link is wrong.'}
        actions={[ { role: 'back', label: 'Back to the orders', onClick: () => undefined } ]}
        className={'rounded-xl border border-border'}
      />
      <EmptyState
        kind={'invalid-view'}
        icon={<Filter />}
        title={'This view needs a district'}
        description={'Choose a district in the filters to see its rounds.'}
        className={'rounded-xl border border-border'}
      />
    </Stack>
  );
}
