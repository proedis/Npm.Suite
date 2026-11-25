import * as React from 'react';

import { Container, Stack } from '@proedis/ui/layout';

import { Block } from '@/examples/layout/Block';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={3} className={'w-full rounded-lg border border-dashed border-border py-3'}>
      <Container>
        <Block>padded: 1rem, 1.5rem from sm, 2rem from lg</Block>
      </Container>
      <Container padded={false}>
        <Block>padded=’false’: edge to edge</Block>
      </Container>
    </Stack>
  );
}
