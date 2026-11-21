import * as React from 'react';

import { Stack } from '@proedis/ui/layout';


const DISTRICTS = [ 'North', 'South', 'East', 'West', 'Centre', 'Hills', 'Harbour', 'Airport' ];


export default function Example(): React.ReactNode {
  return (
    /* One column on a phone, two from sm, four from lg */
    <Stack columns={{ base: 1, sm: 2, lg: 4 }} gap={3} className={'w-full'}>
      {DISTRICTS.map((district) => (
        <span key={district} className={'rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground'}>
          {district}
        </span>
      ))}
    </Stack>
  );
}
