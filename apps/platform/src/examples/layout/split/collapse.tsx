import * as React from 'react';

import { Split } from '@proedis/ui/layout';

import { Block } from '@/examples/layout/Block';


export default function Example(): React.ReactNode {
  return (
    <Split
      collapseBelow={'lg'}
      rail={<Block className={'py-6'}>Filters: above on a phone, beside from lg</Block>}
      railWidth={'14rem'}
      gap={{ base: 3, lg: 6 }}
      className={'w-full'}
    >
      <Block className={'py-6'}>Results</Block>
    </Split>
  );
}
