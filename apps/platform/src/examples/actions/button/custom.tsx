import * as React from 'react';

import { Sparkles } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { Cluster } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Cluster gap={3}>
      {/* className goes last, so it wins over the button's own classes */}
      <Button className={'rounded-full px-5'} leading={<Sparkles />}>Try the new editor</Button>
      <Button fill={'soft'} className={'min-w-32'}>Wider</Button>
    </Cluster>
  );
}
