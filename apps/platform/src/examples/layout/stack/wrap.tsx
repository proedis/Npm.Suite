import * as React from 'react';

import { Stack } from '@proedis/ui/layout';

import { Block } from '@/examples/layout/Block';


const STOPS = [ 'Via Roma 12', 'Corso Torino 4', 'Piazza Cavour', 'Via Po 31', 'Strada del Fortino', 'Via Garibaldi 7', 'Largo Saluzzo' ];


export default function Example(): React.ReactNode {
  return (
    <Stack direction={'horizontal'} wrap gap={2} className={'max-w-md'}>
      {STOPS.map((stop) => <Block key={stop}>{stop}</Block>)}
    </Stack>
  );
}
