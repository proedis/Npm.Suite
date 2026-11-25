import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { Tooltip } from '@proedis/ui/actions/tooltip';


export default function Example(): React.ReactNode {
  return (
    /* The second line reaches a screen reader too, through aria-describedby on the button */
    <Tooltip content={'Not ready to close'} description={'Two stops of the round are still open'}>
      <Button disabled focusableWhenDisabled>Close the round</Button>
    </Tooltip>
  );
}
