import * as React from 'react';

import { Badge } from '@proedis/ui/display/badge';
import { Stack } from '@proedis/ui/layout';


/** A safety net, not a layout: a truncated badge says its column is too narrow */
export default function Example(): React.ReactNode {
  return (
    <Stack gap={2} className={'w-40 rounded-xl border border-dashed border-border p-3'}>
      <Badge tone={'info'} dot>Waiting for the customer’s confirmation</Badge>
      <Badge tone={'success'}>Collected</Badge>
    </Stack>
  );
}
