import * as React from 'react';

import { Checkbox } from '@proedis/ui/forms/checkbox';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={4} className={'w-full max-w-sm'}>
      <Checkbox description={'The bins of the round are weighed one by one, and the weight goes on the invoice.'}>
        Weigh at the pick-up
      </Checkbox>
      <Checkbox disabled description={'Only the rear loaders carry a camera.'}>
        Photograph every bin
      </Checkbox>
    </Stack>
  );
}
