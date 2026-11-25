import * as React from 'react';

import { Badge } from '@proedis/ui/display/badge';
import { Cluster } from '@proedis/ui/layout';


/** A badge that navigates: the element is the caller’s, and so are its semantics */
export default function Example(): React.ReactNode {
  return (
    <Cluster gap={2}>
      <Badge as={'a'} href={'#tags'} tone={'primary'} className={'hover:underline'}>Paper</Badge>
      <Badge as={'a'} href={'#tags'} tone={'primary'} className={'hover:underline'}>Glass</Badge>
      <Badge as={'a'} href={'#tags'} tone={'primary'} className={'hover:underline'}>Organic</Badge>
    </Cluster>
  );
}
