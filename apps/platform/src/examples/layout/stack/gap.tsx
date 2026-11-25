import * as React from 'react';

import { SPACING_TOKENS } from '@proedis/ui/core';
import { Stack } from '@proedis/ui/layout';

import { Block } from '@/examples/layout/Block';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={'sm'}>
      {SPACING_TOKENS.map((step) => (
        <Stack key={step} direction={'horizontal'} align={'center'}>
          <span className={'w-20 font-mono text-xs text-muted-foreground'}>{`gap='${step}'`}</span>
          <Stack direction={'horizontal'} gap={step}>
            <Block>A</Block>
            <Block>B</Block>
            <Block>C</Block>
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}
