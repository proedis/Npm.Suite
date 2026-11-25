import * as React from 'react';

import { Box, Stack } from '@proedis/ui/layout';

import { Block } from '@/examples/layout/Block';


export default function Example(): React.ReactNode {
  return (
    <Stack direction={'horizontal'} gap={4}>
      <Block>Search</Block>

      {/* Two items of the stack, hidden together below lg; from lg they keep the stack's gap */}
      <Box className={'contents'} hideBelow={'lg'}>
        <Block>Export</Block>
        <Block>Print</Block>
      </Box>

      <Block>New</Block>
    </Stack>
  );
}
