import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { Alert } from '@proedis/ui/feedback/alert';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  const [ visible, setVisible ] = React.useState(true);

  const handleDismiss = React.useCallback(() => setVisible(false), []);
  const handleShow = React.useCallback(() => setVisible(true), []);

  return (
    <Stack gap={3} align={'start'} className={'w-full max-w-xl'}>
      {visible && (
        <Alert tone={'success'} title={'Import completed'} onDismiss={handleDismiss} dismissLabel={'Dismiss'}>
          214 collection points were imported from the spreadsheet.
        </Alert>
      )}
      {!visible && <Button size={'sm'} fill={'plain'} onClick={handleShow}>Show it again</Button>}
    </Stack>
  );
}
