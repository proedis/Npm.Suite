import * as React from 'react';

import { Split } from '@proedis/ui/layout';

import { Block } from '@/examples/layout/Block';


export default function Example(): React.ReactNode {
  return (
    <Split
      railHide={{ base: true, md: false }}
      railWidth={{ base: '12rem', xl: '18rem' }}
      rail={<Block className={'py-6'}>Navigation: hidden on a phone, 12rem from md, 18rem from xl</Block>}
      className={'w-full'}
    >
      <Block className={'py-6'}>Page</Block>
    </Split>
  );
}
