import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { Stack } from '@proedis/ui/layout';
import { Popover } from '@proedis/ui/overlays/popover';
import { Skeleton } from '@proedis/ui/primitives';


export default function Example(): React.ReactNode {
  const [ open, setOpen ] = React.useState(false);
  const [ notes, setNotes ] = React.useState<readonly string[] | null>(null);

  /** The notes arrive from the server a second after the popover opened */
  React.useEffect(() => {
    if (!open) {
      return undefined;
    }

    const timer = window.setTimeout(() => setNotes([ 'Gate closed on Mondays: ring 3.', 'Container behind the bar, on the left.' ]), 1000);
    return () => window.clearTimeout(timer);
  }, [ open ]);

  const handleOpenChange = React.useCallback((next: boolean) => {
    setOpen(next);

    if (next) {
      setNotes(null);
    }
  }, []);

  return (
    <Popover
      open={open}
      onOpenChange={handleOpenChange}
      title={'Notes for CP-0412'}
      busy={notes === null}
      trigger={<Button fill={'soft'} tone={'secondary'}>Notes (2)</Button>}
      labels={{ close: 'Close' }}
    >
      {notes === null
        ? <Skeleton lines={2} />
        : (
          <Stack as={'ul'} gap={1.5} className={'list-disc ps-4'}>
            {notes.map((note) => <li key={note}>{note}</li>)}
          </Stack>
        )}
    </Popover>
  );
}
