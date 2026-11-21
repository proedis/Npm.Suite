import * as React from 'react';

import { Trash2 } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { AlertDialog } from '@proedis/ui/overlays/alert-dialog';

import LABELS from './labels';


export default function Example(): React.ReactNode {
  const [ open, setOpen ] = React.useState(false);

  return (
    <React.Fragment>
      <Button fill={'plain'} tone={'destructive'} leading={<Trash2 />} onClick={() => setOpen(true)}>Delete the district</Button>

      {/* With confirmText the field needs its label, hint and error: the type makes them required */}
      <AlertDialog
        open={open}
        onOpenChange={setOpen}
        icon={<Trash2 />}
        title={'Delete the North district?'}
        description={'It cannot be recovered.'}
        consequences={'Its 14 routes, 412 stops and three years of collection history are deleted with it.'}
        confirmText={'North district'}
        actionLabel={'Delete district'}
        onAction={() => setOpen(false)}
        cancelLabel={'Cancel'}
        labels={{
          ...LABELS,
          confirmField   : 'Name of the district',
          confirmHint    : (text) => <span>Type <strong>{text}</strong> to confirm.</span>,
          confirmMatch   : 'The name matches.',
          confirmMismatch: (text) => `Type ${text} exactly as written.`
        }}
      />
    </React.Fragment>
  );
}
