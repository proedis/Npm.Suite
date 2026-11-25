import * as React from 'react';

import { Stack } from '@proedis/ui/layout';


/** Between the children of a stack, a hairline with no separator element and none at the edges */
export default function Example(): React.ReactNode {
  return (
    <Stack gap={0} divided className={'w-full max-w-md rounded-xl border border-border text-sm'}>
      <p className={'px-4 py-3'}>Paper and cardboard</p>
      <p className={'px-4 py-3'}>Glass</p>
      <p className={'px-4 py-3'}>Organic waste</p>
    </Stack>
  );
}
