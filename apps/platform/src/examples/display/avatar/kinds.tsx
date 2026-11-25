import * as React from 'react';

import { Avatar } from '@proedis/ui/display/person';
import { Cluster } from '@proedis/ui/layout';

import { PORTRAIT_SRC } from '@/examples/display/person/photo';


/** Alone, each circle has a name and a tooltip: hover them, or reach them with Tab */
export default function Example(): React.ReactNode {
  return (
    <Cluster gap={4}>
      <Avatar kind={'person'} name={'Rossi Mario'} initials={'RM'} size={40} />
      <Avatar kind={'person'} name={'Bianchi Laura'} initials={'BL'} src={PORTRAIT_SRC} size={40} />
      <Avatar kind={'person'} name={'Cavanna Marco'} initials={'CM'} current size={40} />
      <Avatar kind={'person'} name={'Verdi Paolo'} initials={'VP'} inactive stateLabel={'account disabled'} size={40} />
      <Avatar kind={'organization'} name={'Comune di Chieri'} size={40} />
      <Avatar kind={'system'} name={'Automatic import'} size={40} />
      <Avatar kind={'unknown'} name={'Unknown user'} size={40} />
    </Cluster>
  );
}
