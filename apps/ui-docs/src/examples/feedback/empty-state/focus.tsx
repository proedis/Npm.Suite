import * as React from 'react';

import { CircleAlert } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { EmptyState } from '@proedis/ui/feedback/empty-state';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  const titleRef = React.useRef<HTMLElement>(null);
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
          <EmptyState
            ref={titleRef}
            kind={'error'}
            icon={<CircleAlert />}
            title={'The stops did not load'}
            description={'The server did not answer. Your data is safe.'}
            actions={[ { role: 'retry', label: 'Try again', onClick: handleRetry } ]}
          />
        )
        : <Button fill={'soft'} onClick={handleLoad}>Load the stops</Button>}
    </Stack>
  );
}
