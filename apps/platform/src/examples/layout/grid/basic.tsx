import * as React from 'react';

import { Grid } from '@proedis/ui/layout';

import { Block } from '@/examples/layout/Block';


export default function Example(): React.ReactNode {
  return (
    <Grid minColWidth={160} gap={4} className={'w-full'}>
      {Array.from({ length: 7 }, (_, index) => (
        <Block key={index} className={'py-8 text-center'}>Card {index + 1}</Block>
      ))}
    </Grid>
  );
}
