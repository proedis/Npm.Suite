import * as React from 'react';

import { BadgeDot } from '@proedis/ui/display/badge-dot';
import { Avatar } from '@proedis/ui/display/person';
import { Cluster } from '@proedis/ui/layout';

import { PORTRAIT_SRC } from '@/examples/display/person/photo';


/** The mark says it to the eye, stateLabel to everybody: the tooltip and the name of the image carry it */
export default function Example(): React.ReactNode {
  return (
    <Cluster gap={'lg'}>
      <Avatar
        kind={'person'}
        name={'Bianchi Laura'}
        initials={'BL'}
        src={PORTRAIT_SRC}
        size={40}
        stateLabel={'online'}
        indicator={<BadgeDot tone={'success'} size={'md'} pulse ring />}
      />
      <Avatar
        kind={'person'}
        name={'Rossi Mario'}
        initials={'RM'}
        size={40}
        stateLabel={'away'}
        indicator={<BadgeDot tone={'warning'} size={'md'} ring />}
      />
      <Avatar
        kind={'person'}
        name={'Verdi Paolo'}
        initials={'VP'}
        size={56}
        stateLabel={'offline'}
        indicator={<BadgeDot tone={'muted'} size={'lg'} ring />}
      />
    </Cluster>
  );
}
