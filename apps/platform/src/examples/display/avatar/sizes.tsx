import * as React from 'react';

import { Avatar } from '@proedis/ui/display/person';
import { Cluster } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Cluster gap={4}>
      <Avatar kind={'person'} name={'Rossi Mario'} initials={'RM'} size={24} />
      <Avatar kind={'person'} name={'Rossi Mario'} initials={'RM'} size={32} />
      <Avatar kind={'person'} name={'Rossi Mario'} initials={'RM'} size={40} />
      <Avatar kind={'person'} name={'Rossi Mario'} initials={'RM'} size={56} />
    </Cluster>
  );
}
