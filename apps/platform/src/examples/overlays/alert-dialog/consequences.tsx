import * as React from 'react';

import { Trash2 } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { AlertDialog } from '@proedis/ui/overlays/alert-dialog';

import LABELS from './labels';


export default function Example(): React.ReactNode {
  const [ open, setOpen ] = React.useState(false);
  const [ stops, setStops ] = React.useState<readonly string[] | null>(null);

  /** What the deletion touches arrives from the server: the action stays off until it has */
  React.useEffect(() => {
    if (!open) {
      return undefined;
    }

    const timer = window.setTimeout(() => setStops([ 'Via Roma 18', 'Piazza Cavour 3', 'Via Vittorio Veneto 41' ]), 1200);
    return () => window.clearTimeout(timer);
  }, [ open ]);

  const handleOpen = React.useCallback(() => {
    setStops(null);
    setOpen(true);
  }, []);

  return (
    <React.Fragment>
      <Button fill={'plain'} tone={'destructive'} leading={<Trash2 />} onClick={handleOpen}>Delete the container type</Button>

      <AlertDialog
        open={open}
        onOpenChange={setOpen}
        icon={<Trash2 />}
        title={'Delete the container type “Organic 240 l”?'}
        description={'It cannot be recovered.'}
        consequences={(
          <ul className={'list-disc ps-4'}>
            {(stops ?? []).map((stop) => <li key={stop}>{stop} loses its organic container</li>)}
          </ul>
        )}
        busy={stops ? false : 'load'}
        actionLabel={'Delete container type'}
        onAction={() => setOpen(false)}
        cancelLabel={'Cancel'}
        labels={LABELS}
      />
    </React.Fragment>
  );
}
