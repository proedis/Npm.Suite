import * as React from 'react';

import { TriangleAlert } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { AlertDialog } from '@proedis/ui/overlays/alert-dialog';

import LABELS from './labels';


export default function Example(): React.ReactNode {
  const [ open, setOpen ] = React.useState(false);

  return (
    <React.Fragment>
      <Button fill={'soft'} tone={'secondary'} onClick={() => setOpen(true)}>Leave the import</Button>

      {/* `warning` only to discard what was never saved; deleting anything saved is `destructive` */}
      <AlertDialog
        open={open}
        onOpenChange={setOpen}
        tone={'warning'}
        icon={<TriangleAlert />}
        title={'Discard the import?'}
        description={'The 214 rows you mapped are lost. Nothing was saved yet.'}
        actionLabel={'Discard import'}
        onAction={() => setOpen(false)}
        cancelLabel={'Keep editing'}
        labels={LABELS}
      />
    </React.Fragment>
  );
}
