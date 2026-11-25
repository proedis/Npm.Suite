import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { Cluster } from '@proedis/ui/layout';

import { notifications } from './setup';


export default function Example(): React.ReactNode {
  const handleSave = React.useCallback(() => {
    notifications.notify.done({ title: 'Route R-14 saved' });
  }, []);

  const handleDelete = React.useCallback(() => {
    notifications.notify.done({
      title: 'Stop 12 deleted',
      undo : {
        onClick: () => notifications.notify.done({ title: 'Stop 12 restored' }),
        until  : new Date(Date.now() + 5 * 60 * 1000)
      }
    });
  }, []);

  return (
    <Cluster gap={3}>
      <Button onClick={handleSave}>Save the route</Button>
      <Button fill={'soft'} tone={'destructive'} onClick={handleDelete}>Delete the stop</Button>
    </Cluster>
  );
}
