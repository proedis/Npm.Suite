import * as React from 'react';

import { Stack } from '@proedis/ui/layout';

import { Block } from '@/examples/layout/Block';


export default function Example(): React.ReactNode {
  return (
    <Stack
      direction={{ base: 'vertical', md: 'horizontal' }}
      align={{ base: 'stretch', md: 'center' }}
      gap={{ base: 2, md: 6 }}
      divided
      className={'w-full rounded-lg border border-dashed border-border p-3'}
    >
      <Block className={'md:flex-1'}>A column on a phone</Block>
      <Block className={'md:flex-1'}>a row from md</Block>
      <Block className={'md:flex-1'}>with a wider gap</Block>
    </Stack>
  );
}
