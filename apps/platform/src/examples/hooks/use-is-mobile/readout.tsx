import * as React from 'react';

import { Badge } from '@proedis/ui/display/badge';
import { useIsMobile } from '@proedis/ui/hooks';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  const belowMd = useIsMobile();
  const belowLg = useIsMobile('lg');

  return (
    <Stack gap={2.5} className={'w-full max-w-md'}>
      <Stack direction={'horizontal'} align={'center'} justify={'between'} gap={4}>
        <span className={'font-mono text-sm'}>useIsMobile()</span>
        <Badge fill={'soft'} tone={belowMd ? 'info' : 'muted'}>{belowMd ? 'below 768px' : '768px and wider'}</Badge>
      </Stack>
      <Stack direction={'horizontal'} align={'center'} justify={'between'} gap={4}>
        <span className={'font-mono text-sm'}>{'useIsMobile(\'lg\')'}</span>
        <Badge fill={'soft'} tone={belowLg ? 'info' : 'muted'}>{belowLg ? 'below 1024px' : '1024px and wider'}</Badge>
      </Stack>
    </Stack>
  );
}
