import * as React from 'react';

import { Layers } from 'lucide-react';

import { Toggle } from '@proedis/ui/actions/toggle';
import { Cluster } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Cluster gap={'md'}>
      <Toggle size={'sm'} leading={<Layers />} defaultPressed>Small</Toggle>
      <Toggle size={'md'} leading={<Layers />} defaultPressed>Medium</Toggle>
      <Toggle size={'lg'} leading={<Layers />} defaultPressed>Large</Toggle>
      <Toggle size={'sm'} aria-label={'Layers, small'} leading={<Layers />} />
      <Toggle size={'md'} aria-label={'Layers, medium'} leading={<Layers />} />
      <Toggle size={'lg'} aria-label={'Layers, large'} leading={<Layers />} />
    </Cluster>
  );
}
