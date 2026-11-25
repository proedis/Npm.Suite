import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { Alert } from '@proedis/ui/feedback/alert';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  const [ failed, setFailed ] = React.useState(false);

  const handleSync = React.useCallback(() => setFailed(true), []);
  const handleReset = React.useCallback(() => setFailed(false), []);

  return (
    <Stack gap={3} align={'start'} className={'w-full max-w-xl'}>
      <Button size={'sm'} fill={'soft'} onClick={failed ? handleReset : handleSync}>
        {failed ? 'Reset' : 'Synchronise the tablets'}
      </Button>

      {/* Appears after the page opened: live, so it is announced once */}
      {failed && (
        <Alert live tone={'destructive'} toneLabel={'Error'} title={'Synchronisation failed'}>
          Three tablets did not answer. They will try again at the next connection.
        </Alert>
      )}
    </Stack>
  );
}
