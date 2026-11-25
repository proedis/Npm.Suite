import * as React from 'react';

import { Switch } from '@proedis/ui/forms/switch';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={4} className={'w-full max-w-sm'}>
      <Switch defaultChecked description={'The planner skips the stops that reported a full bin less than a day ago.'}>
        Skip the recently emptied bins
      </Switch>
      <Switch readOnly defaultChecked description={'Set by the fleet office for every vehicle.'}>
        GPS tracking
      </Switch>
      <Switch disabled description={'Only the vehicles with a scale can weigh.'}>
        Weigh every pick-up
      </Switch>
    </Stack>
  );
}
