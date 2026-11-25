import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { Tooltip } from '@proedis/ui/actions/tooltip';


export default function Example(): React.ReactNode {
  return (
    <Tooltip content={'Sends the order to the customer by email'}>
      <Button fill={'soft'}>Send</Button>
    </Tooltip>
  );
}
