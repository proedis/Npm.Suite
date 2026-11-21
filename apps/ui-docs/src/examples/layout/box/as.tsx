import * as React from 'react';

import { Box } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Box as={'section'} aria-labelledby={'depot-title'} className={'w-full max-w-md rounded-lg border border-border p-5'}>
      <h3 id={'depot-title'} className={'font-semibold text-foreground'}>North depot</h3>
      <p className={'mt-1 text-sm text-muted-foreground'}>Via del Fortino 18, open from 5:30 to 21:00.</p>
      <Box as={'a'} href={'#directions'} className={'mt-3 inline-block text-sm font-medium text-primary hover:underline'}>
        Directions
      </Box>
    </Box>
  );
}
