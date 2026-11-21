import * as React from 'react';

import { Box, Stack } from '@proedis/ui/layout';

import { Block } from '@/examples/layout/Block';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={3} className={'w-full max-w-md'}>
      <Box hideBelow={'md'}>
        <Block>Shown from md up: hideBelow=’md’</Block>
      </Box>
      <Box hideFrom={'md'}>
        <Block>Shown below md only: hideFrom=’md’</Block>
      </Box>
      <Block>Always shown</Block>
    </Stack>
  );
}
