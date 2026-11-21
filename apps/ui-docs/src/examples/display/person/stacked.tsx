import * as React from 'react';

import { Person } from '@proedis/ui/display/person';
import { Stack } from '@proedis/ui/layout';


/** A history: the person above, what they did under */
export default function Example(): React.ReactNode {
  return (
    <Stack as={'ol'} gap={4} className={'w-full max-w-sm'}>
      <li>
        <Person layout={'stacked'} avatar={{ kind: 'person', name: 'Rossi Mario', initials: 'RM' }} name={'Rossi Mario'}>
          Marked skip 1204 as collected, 12:04
        </Person>
      </li>
      <li>
        <Person layout={'stacked'} avatar={{ kind: 'system', name: 'Automatic import' }} name={'Automatic import'}>
          Created the order from the municipality’s feed, 08:00
        </Person>
      </li>
      <li>
        <Person layout={'stacked'} avatar={{ kind: 'organization', name: 'Comune di Chieri' }} name={'Comune di Chieri'}>
          Requested a bulky items collection, yesterday
        </Person>
      </li>
    </Stack>
  );
}
