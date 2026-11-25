import * as React from 'react';

import { AvatarGroup } from '@proedis/ui/display/person';
import { Stack } from '@proedis/ui/layout';

import type { AvatarGroupItem } from '@proedis/ui/display/person';


const PEOPLE: readonly [ string, string, string ][] = [
  [ 'rm', 'Rossi Mario', 'RM' ],
  [ 'bl', 'Bianchi Laura', 'BL' ],
  [ 'vp', 'Verdi Paolo', 'VP' ],
  [ 'nf', 'Neri Francesca', 'NF' ],
  [ 'gs', 'Galli Stefano', 'GS' ],
  [ 'cr', 'Conti Roberta', 'CR' ]
];

const OPERATORS: readonly AvatarGroupItem[] = PEOPLE.map(([ id, name, initials ]) => ({
  id,
  name,
  avatar     : { kind: 'person', name, initials },
  description: 'Driver, Chieri depot'
}));


export default function Example(): React.ReactNode {
  return (
    <Stack gap={5} align={'start'}>
      {/* Four people: all four show, the count appears from two hidden up */}
      <AvatarGroup
        items={OPERATORS.slice(0, 4)}
        label={`Operators: ${PEOPLE.slice(0, 4).map(([ , name ]) => name).join(', ')}`}
        title={'Operators · Round 14'}
      />
      {/* Six people at 32px: three circles and the count */}
      <AvatarGroup
        size={32}
        items={OPERATORS}
        label={`Operators: ${PEOPLE.map(([ , name ]) => name).join(', ')}`}
        title={'Operators · Round 15'}
      />
    </Stack>
  );
}
