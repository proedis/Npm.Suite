import * as React from 'react';

import { Stack } from '@proedis/ui/layout';

import { Block } from '@/examples/layout/Block';


/** A region that redeclares the scale: everything inside it named `sm` or `md` tightens, nothing outside moves */
const DENSE = { '--space-sm': '0.25rem', '--space-md': '0.5rem' } as React.CSSProperties;


function Column(props: { title: string }): React.ReactNode {
  return (
    <Stack>
      <span className={'text-xs font-medium text-muted-foreground'}>{props.title}</span>
      <Block>Route 12, Chieri north</Block>
      <Block>Route 14, Pino Torinese</Block>
      <Stack direction={'horizontal'} gap={'sm'}>
        <Block>Plastic</Block>
        <Block>Paper</Block>
      </Stack>
    </Stack>
  );
}


export default function Example(): React.ReactNode {
  return (
    <Stack columns={{ base: 1, md: 2 }} gap={'xl'} className={'w-full'}>
      <Column title={'The theme'} />
      <div style={DENSE}>
        <Column title={'A region with --space-md: 0.5rem'} />
      </div>
    </Stack>
  );
}
