import * as React from 'react';

import { Badge } from '@proedis/ui/display/badge';
import { useBreakpoint } from '@proedis/ui/hooks';
import { Stack } from '@proedis/ui/layout';


/** The widest breakpoint the window has reached, read with the hook of the package */
function useCurrentBreakpoint(): string {
  const sm = useBreakpoint('sm');
  const md = useBreakpoint('md');
  const lg = useBreakpoint('lg');
  const xl = useBreakpoint('xl');
  const xxl = useBreakpoint('2xl');

  return (xxl && '2xl') || (xl && 'xl') || (lg && 'lg') || (md && 'md') || (sm && 'sm') || 'base';
}


function Block(props: { children: React.ReactNode }): React.ReactNode {
  return <span className={'grow rounded-lg bg-primary-soft px-4 py-3 text-sm font-medium text-primary-soft-foreground'}>{props.children}</span>;
}


export default function Example(): React.ReactNode {
  const current = useCurrentBreakpoint();

  return (
    <Stack gap={4} className={'w-full'}>
      <Badge fill={'solid'} tone={'info'} className={'self-start'}>The window is at {current}</Badge>

      {/* A column on a phone, a row from md, with a wider gap from lg */}
      <Stack direction={{ base: 'vertical', md: 'horizontal' }} gap={{ base: 2, lg: 6 }}>
        <Block>Collection</Block>
        <Block>Transport</Block>
        <Block>Disposal</Block>
      </Stack>
    </Stack>
  );
}
