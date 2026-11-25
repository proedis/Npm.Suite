import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { Cluster } from '@proedis/ui/layout';
import { Dialog } from '@proedis/ui/overlays/dialog';

import type { DialogRadius } from '@proedis/ui/overlays/dialog';


const RADII: readonly DialogRadius[] = [ 'none', 'md', 'default', 'xl', '2xl' ];


/** One dialog, opened with the corner of the button pressed */
export default function Example(): React.ReactNode {
  const [ radius, setRadius ] = React.useState<DialogRadius | null>(null);

  const handleOpenChange = React.useCallback((open: boolean) => {
    if (!open) {
      setRadius(null);
    }
  }, []);

  return (
    <React.Fragment>
      <Cluster>
        {RADII.map((item) => (
          <Button key={item} fill={'soft'} tone={'muted'} onClick={() => setRadius(item)}>{`radius="${item}"`}</Button>
        ))}
      </Cluster>

      <Dialog
        open={radius !== null}
        onOpenChange={handleOpenChange}
        radius={radius ?? 'default'}
        title={'Close the round'}
        description={`radius="${radius ?? 'default'}"`}
        footer={(
          <React.Fragment>
            <Dialog.Cancel>Cancel</Dialog.Cancel>
            <Button onClick={() => setRadius(null)}>Close the round</Button>
          </React.Fragment>
        )}
        labels={{ close: 'Close' }}
      >
        The 38 stops of the North district are done: the round closes and its report goes to the office.
      </Dialog>
    </React.Fragment>
  );
}
