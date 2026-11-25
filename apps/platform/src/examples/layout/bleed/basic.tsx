import * as React from 'react';

import { Bleed, Container, Stack } from '@proedis/ui/layout';

import { Block } from '@/examples/layout/Block';


export default function Example(): React.ReactNode {
  return (
    <div className={'w-full rounded-lg border border-dashed border-border py-4'}>
      <Container>
        <Stack gap={3}>
          <Block>Text in the column of the container</Block>
          {/* Undoes exactly the padding of the container, at every breakpoint */}
          <Bleed>
            <Block className={'rounded-none py-6 text-center'}>A band from edge to edge</Block>
          </Bleed>
          <Block>Back in the column</Block>
        </Stack>
      </Container>
    </div>
  );
}
