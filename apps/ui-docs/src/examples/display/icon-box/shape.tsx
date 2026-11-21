import * as React from 'react';

import { Check, MapPin } from 'lucide-react';

import { IconBox } from '@proedis/ui/display/icon-box';
import { Cluster } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Cluster gap={4}>
      <IconBox tone={'primary'}><MapPin /></IconBox>
      <IconBox tone={'primary'} shape={'round'}><MapPin /></IconBox>
      <IconBox tone={'success'} fill={'solid'} shape={'round'} size={'sm'}><Check /></IconBox>
    </Cluster>
  );
}
