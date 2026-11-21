import * as React from 'react';

import { Center } from '@proedis/ui/layout';
import { Spinner } from '@proedis/ui/primitives';


/** On its own, with nothing around it saying what happens: the label is announced */
export default function Example(): React.ReactNode {
  return (
    <Center minHeight={160} className={'w-full max-w-sm rounded-xl border border-dashed border-border text-primary'}>
      <Spinner size={'lg'} label={'Loading the routes'} />
    </Center>
  );
}
