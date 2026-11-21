import * as React from 'react';

import { Container } from '@proedis/ui/layout';

import { Block } from '@/examples/layout/Block';


export default function Example(): React.ReactNode {
  return (
    <div className={'w-full rounded-lg border border-dashed border-border py-4'}>
      <Container size={'sm'}>
        <Block>The content of the page, at most 48rem wide, with the side padding of the container</Block>
      </Container>
    </div>
  );
}
