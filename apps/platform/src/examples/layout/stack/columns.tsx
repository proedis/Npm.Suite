import * as React from 'react';

import { Stack } from '@proedis/ui/layout';

import { Block } from '@/examples/layout/Block';


export default function Example(): React.ReactNode {
  return (
    <Stack columns={{ base: 1, sm: 2, lg: 4 }} gap={4} className={'w-full'}>
      {Array.from({ length: 8 }, (_, index) => (
        <Block key={index} className={'py-6 text-center'}>{String(index + 1).padStart(2, '0')}</Block>
      ))}
    </Stack>
  );
}
