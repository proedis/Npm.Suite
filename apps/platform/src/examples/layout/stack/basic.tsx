import * as React from 'react';

import { Stack } from '@proedis/ui/layout';

import { Block } from '@/examples/layout/Block';


export default function Example(): React.ReactNode {
  return (
    <Stack className={'w-full max-w-sm'}>
      <Block>01</Block>
      <Block>02</Block>
      <Block>03</Block>
    </Stack>
  );
}
