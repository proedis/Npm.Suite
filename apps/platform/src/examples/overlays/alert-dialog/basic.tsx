import * as React from 'react';

import { Trash2 } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { AlertDialog } from '@proedis/ui/overlays/alert-dialog';

import LABELS from './labels';


export default function Example(): React.ReactNode {
  const [ open, setOpen ] = React.useState(false);

  return (
    <React.Fragment>
      <Button fill={'plain'} tone={'destructive'} leading={<Trash2 />} onClick={() => setOpen(true)}>Delete the route</Button>

      <AlertDialog
        open={open}
        onOpenChange={setOpen}
        icon={<Trash2 />}
        title={'Delete route R-14?'}
        description={'It cannot be recovered. Its stops stay in the register.'}
        actionLabel={'Delete route'}
        onAction={() => setOpen(false)}
        cancelLabel={'Cancel'}
        labels={LABELS}
      />
    </React.Fragment>
  );
}
