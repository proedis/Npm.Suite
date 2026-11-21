import * as React from 'react';

import { Badge } from '@proedis/ui/display/badge';
import { useBreakpoint } from '@proedis/ui/hooks';
import { Stack } from '@proedis/ui/layout';


/** One row per breakpoint: resize the window and watch them switch, from the widest down */
function Row(props: { breakpoint: 'sm' | 'md' | 'lg' | 'xl' | '2xl'; width: number }): React.ReactNode {
  const { breakpoint, width } = props;
  const matches = useBreakpoint(breakpoint);

  return (
    <Stack direction={'horizontal'} align={'center'} justify={'between'} gap={4}>
      <span className={'font-mono text-sm'}>{`useBreakpoint('${breakpoint}')`}</span>
      <Stack direction={'horizontal'} align={'center'} gap={3}>
        <span className={'text-xs text-muted-foreground'}>{width}px and wider</span>
        <Badge fill={'soft'} tone={matches ? 'success' : 'muted'} className={'w-14 justify-center'}>{String(matches)}</Badge>
      </Stack>
    </Stack>
  );
}


export default function Example(): React.ReactNode {
  return (
    <Stack gap={2.5} className={'w-full max-w-md'}>
      <Row breakpoint={'sm'} width={640} />
      <Row breakpoint={'md'} width={768} />
      <Row breakpoint={'lg'} width={1024} />
      <Row breakpoint={'xl'} width={1280} />
      <Row breakpoint={'2xl'} width={1536} />
    </Stack>
  );
}
