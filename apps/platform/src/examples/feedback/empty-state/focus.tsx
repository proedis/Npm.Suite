import * as React from 'react';

import { CircleAlert } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { EmptyState } from '@proedis/ui/feedback/empty-state';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  const titleRef = React.useRef<HTMLDivElement>(null);
  const [ failed, setFailed ] = React.useState(false);

  /* The load fails: the empty state replaces the content and its title takes the focus */
  React.useEffect(() => {
    if (failed) {
      titleRef.current?.focus();
    }
  }, [ failed ]);

  const handleLoad = React.useCallback(() => setFailed(true), []);
  const handleRetry = React.useCallback(() => setFailed(false), []);

  return (
    <Stack align={'center'} gap={3} className={'w-full'}>
      {failed
        ? (
          <EmptyState tone={'destructive'}>
            <EmptyState.Icon><CircleAlert /></EmptyState.Icon>
            <EmptyState.Title ref={titleRef}>The stops did not load</EmptyState.Title>
            <EmptyState.Description>The server did not answer. Your data is safe.</EmptyState.Description>
            <EmptyState.Actions><Button size={'sm'} tone={'muted'} onClick={handleRetry}>Try again</Button></EmptyState.Actions>
          </EmptyState>
        )
        : <Button fill={'soft'} onClick={handleLoad}>Load the stops</Button>}
    </Stack>
  );
}
