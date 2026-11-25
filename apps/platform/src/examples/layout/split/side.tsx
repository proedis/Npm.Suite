import * as React from 'react';

import { Split } from '@proedis/ui/layout';

import { Block } from '@/examples/layout/Block';


export default function Example(): React.ReactNode {
  return (
    <Split side={'end'} rail={<Block className={'py-10'}>Inspector, 200px</Block>} railWidth={200} gap={4} className={'w-full'}>
      <Block className={'py-10'}>Content first in the DOM, so read and tabbed first</Block>
    </Split>
  );
}
