import * as React from 'react';

import { Grid, Stack } from '@proedis/ui/layout';

import { Block } from '@/examples/layout/Block';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={6} className={'w-full'}>
      <Stack gap={1.5}>
        <span className={'font-mono text-xs text-muted-foreground'}>{'fill={\'fill\'}'} keeps the empty tracks</span>
        <Grid minColWidth={160} fill={'fill'} gap={3} className={'rounded-lg border border-dashed border-border p-2'}>
          <Block className={'py-6 text-center'}>One</Block>
          <Block className={'py-6 text-center'}>Two</Block>
        </Grid>
      </Stack>

      <Stack gap={1.5}>
        <span className={'font-mono text-xs text-muted-foreground'}>{'fill={\'fit\'}'} lets the cards stretch</span>
        <Grid minColWidth={160} fill={'fit'} gap={3} className={'rounded-lg border border-dashed border-border p-2'}>
          <Block className={'py-6 text-center'}>One</Block>
          <Block className={'py-6 text-center'}>Two</Block>
        </Grid>
      </Stack>
    </Stack>
  );
}
