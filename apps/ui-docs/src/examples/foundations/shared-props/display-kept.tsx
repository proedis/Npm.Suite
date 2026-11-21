import * as React from 'react';

import { Stack } from '@proedis/ui/layout';


function Block(props: { children: React.ReactNode }): React.ReactNode {
  return <span className={'rounded-lg bg-primary-soft px-4 py-3 text-sm font-medium text-primary-soft-foreground'}>{props.children}</span>;
}


export default function Example(): React.ReactNode {
  const ref = React.useRef<HTMLDivElement>(null);
  const [ classes, setClasses ] = React.useState('');

  React.useEffect(() => {
    setClasses(ref.current?.className ?? '');
  }, []);

  return (
    <Stack gap={4} className={'w-full'}>
      {/* A row with a gap, hidden below md. From md on it is exactly the row it would be without the prop */}
      <Stack ref={ref} hideBelow={'md'} direction={'horizontal'} gap={4}>
        <Block>One</Block>
        <Block>Two</Block>
        <Block>Three</Block>
      </Stack>

      <code className={'rounded-lg bg-muted px-3 py-2 font-mono text-xs text-muted-foreground'}>{classes}</code>
    </Stack>
  );
}
