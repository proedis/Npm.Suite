import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { Tooltip } from '@proedis/ui/actions/tooltip';
import { Cluster } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Cluster gap={3}>
      <Button disabled>Archive</Button>

      {/* Focusable while disabled, so the reason can be read: on hover and with the keyboard */}
      <Tooltip content={'Not ready to publish'} description={'Fill in the three required fields first'}>
        <Button disabled focusableWhenDisabled>Publish</Button>
      </Tooltip>
    </Cluster>
  );
}
