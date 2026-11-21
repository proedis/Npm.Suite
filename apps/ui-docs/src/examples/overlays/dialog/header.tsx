import * as React from 'react';

import { Eye, Plus } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { Cluster } from '@proedis/ui/layout';
import { Dialog } from '@proedis/ui/overlays/dialog';


export default function Example(): React.ReactNode {
  const [ open, setOpen ] = React.useState<'create' | 'read' | null>(null);

  const handleOpenChange = React.useCallback((next: boolean) => {
    if (!next) {
      setOpen(null);
    }
  }, []);

  return (
    <Cluster gap={3}>
      <Button leading={<Plus />} onClick={() => setOpen('create')}>New vehicle</Button>
      <Button fill={'soft'} tone={'secondary'} leading={<Eye />} onClick={() => setOpen('read')}>Preview the route</Button>

      <Dialog
        open={open === 'create'}
        onOpenChange={handleOpenChange}
        icon={<Plus />}
        iconTone={'primary'}
        title={'New vehicle'}
        description={'It joins the fleet of the north depot, available from tomorrow.'}
        footer={(
          <React.Fragment>
            <Dialog.Cancel>Cancel</Dialog.Cancel>
            <Button onClick={() => setOpen(null)}>Create vehicle</Button>
          </React.Fragment>
        )}
        labels={{ close: 'Close' }}
      >
        <p>The icon box is primary when the dialog creates or acts.</p>
      </Dialog>

      <Dialog
        open={open === 'read'}
        onOpenChange={handleOpenChange}
        icon={<Eye />}
        iconTone={'muted'}
        title={'Route R-14, a title long enough to wrap onto a second line rather than being cut'}
        description={'Monday · 38 stops · 61 km'}
        labels={{ close: 'Close' }}
      >
        <p>Muted when it is for reading or choosing. The title wraps and is never truncated.</p>
      </Dialog>
    </Cluster>
  );
}
