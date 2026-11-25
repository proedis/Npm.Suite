import * as React from 'react';

import { AspectRatio, Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack columns={{ base: 1, sm: 3 }} gap={4} align={'start'} className={'w-full'}>
      {[ { label: '16 / 9', ratio: 16 / 9 }, { label: '4 / 3', ratio: 4 / 3 }, { label: '1', ratio: 1 } ].map(({ label, ratio }) => (
        <Stack key={label} gap={1.5}>
          <AspectRatio ratio={ratio} className={'rounded-lg'}>
            <div className={'bg-linear-to-br from-info-soft to-primary-soft'} />
          </AspectRatio>
          <span className={'font-mono text-xs text-muted-foreground'}>ratio={label}</span>
        </Stack>
      ))}
    </Stack>
  );
}
