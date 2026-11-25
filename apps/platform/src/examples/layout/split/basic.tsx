import * as React from 'react';

import { Split } from '@proedis/ui/layout';

import { Block } from '@/examples/layout/Block';


export default function Example(): React.ReactNode {
  return (
    <Split rail={<Block className={'py-10'}>Rail, 12rem</Block>} railWidth={'12rem'} gap={4} className={'w-full'}>
      <Block className={'py-10'}>The pane that takes the rest of the width</Block>
    </Split>
  );
}
