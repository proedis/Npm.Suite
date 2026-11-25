import * as React from 'react';

import { Download, Plus } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={6} className={'w-full'}>
      {/* The header of a list page: a column on a phone, a row from md, the actions at the end */}
      <Stack
        direction={{ base: 'vertical', md: 'horizontal' }}
        align={{ base: 'stretch', md: 'end' }}
        justify={'between'}
        gap={4}
      >
        <Stack gap={1}>
          <h3 className={'text-xl font-semibold text-foreground'}>Collection rounds</h3>
          <p className={'text-sm text-muted-foreground'}>38 rounds this week, 4 still to assign</p>
        </Stack>
        <Stack direction={'horizontal'} gap={2}>
          <Button fill={'soft'} tone={'secondary'} leading={<Download />}>Export</Button>
          <Button leading={<Plus />}>New round</Button>
        </Stack>
      </Stack>

      {/* Three figures, one per column from sm */}
      <Stack columns={{ base: 1, sm: 3 }} gap={4}>
        {[ [ 'Stops', '1,204' ], [ 'Kilometres', '3,880' ], [ 'Tonnes', '92.4' ] ].map(([ label, value ]) => (
          <Stack key={label} gap={1} className={'rounded-lg border border-border p-4'}>
            <span className={'text-xs text-muted-foreground'}>{label}</span>
            <span className={'text-2xl font-semibold text-foreground tabular-nums'}>{value}</span>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
