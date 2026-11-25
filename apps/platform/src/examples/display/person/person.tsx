import * as React from 'react';

import { LabeledContent } from '@proedis/ui/display/labeled-content';
import { Person } from '@proedis/ui/display/person';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  /** What the card shows under the head, rendered for preview only: nothing in it is a Tab stop */
  const card = (
    <React.Fragment>
      <LabeledContent inline>
        <LabeledContent.Label>Role</LabeledContent.Label>
        <LabeledContent.Value>Driver</LabeledContent.Value>
      </LabeledContent>
      <LabeledContent inline>
        <LabeledContent.Label>Depot</LabeledContent.Label>
        <LabeledContent.Value>Chieri</LabeledContent.Value>
      </LabeledContent>
    </React.Fragment>
  );

  return (
    <Stack gap={3} align={'start'}>
      {/* A page and a card: the name is a link, and the card opens on hover and on focus */}
      <Person avatar={{ kind: 'person', name: 'Rossi Mario', initials: 'RM' }} name={'Rossi Mario'} target={'/'} preview={card} />

      {/* Only the card: the name is a button that looks like text */}
      <Person avatar={{ kind: 'person', name: 'Bianchi Laura', initials: 'BL', current: true }} name={'Bianchi Laura'} preview={card} />

      {/* Neither: plain text, and a state that never truncates */}
      <Person
        avatar={{ kind: 'person', name: 'Verdi Paolo', initials: 'VP', inactive: true }}
        name={'Verdi Paolo'}
        suffix={'(account disabled)'}
      />

      {/* The system and an unreadable reference are muted, with no link and no card */}
      <Person avatar={{ kind: 'system', name: 'Automatic import' }} name={'Automatic import'} target={'/'} />
    </Stack>
  );
}
