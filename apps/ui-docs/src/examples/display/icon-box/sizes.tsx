import * as React from 'react';

import { Recycle } from 'lucide-react';

import { IconBox } from '@proedis/ui/display/icon-box';
import { Cluster } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Cluster gap={'md'} align={'end'}>
      <IconBox size={'xs'} tone={'success'}><Recycle /></IconBox>
      <IconBox size={'sm'} tone={'success'}><Recycle /></IconBox>
      <IconBox size={'md'} tone={'success'}><Recycle /></IconBox>
      <IconBox size={'lg'} tone={'success'}><Recycle /></IconBox>
      <IconBox size={'xl'} tone={'success'}><Recycle /></IconBox>
      <IconBox size={'2xl'} tone={'success'}><Recycle /></IconBox>
    </Cluster>
  );
}
