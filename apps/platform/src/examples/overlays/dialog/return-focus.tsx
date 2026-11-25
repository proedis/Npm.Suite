import * as React from 'react';

import { Trash2 } from 'lucide-react';

import { Button, IconButton } from '@proedis/ui/actions/button';
import { Item } from '@proedis/ui/display/item';
import { Stack } from '@proedis/ui/layout';
import { Dialog } from '@proedis/ui/overlays/dialog';


const INITIAL = [ 'Container CP-0412', 'Container CP-0413', 'Container CP-0414' ];


export default function Example(): React.ReactNode {
  const [ rows, setRows ] = React.useState(INITIAL);
  const [ removing, setRemoving ] = React.useState<string | null>(null);
  const headingRef = React.useRef<HTMLHeadingElement>(null);

  const handleRemove = React.useCallback(() => {
    setRows((current) => current.filter((row) => row !== removing));
    setRemoving(null);
  }, [ removing ]);

  return (
    <Stack gap={2} className={'w-full max-w-sm'}>
      <h4 ref={headingRef} tabIndex={-1} className={'text-sm font-semibold outline-none focus-visible:underline'}>
        Containers of the stop ({rows.length})
      </h4>

      {rows.map((row) => (
        <Item key={row} inset className={'rounded-md border border-border'}>
          <span className={'grow'}>{row}</span>
          <Item.Actions>
            <IconButton label={`Remove ${row}`} icon={<Trash2 />} onClick={() => setRemoving(row)} />
          </Item.Actions>
        </Item>
      ))}

      {rows.length < INITIAL.length && (
        <Button size={'sm'} fill={'plain'} className={'self-start'} onClick={() => setRows(INITIAL)}>Put them back</Button>
      )}

      {/* The button that opened it is gone with its row: the focus goes to the heading of the list instead */}
      <Dialog
        open={removing !== null}
        onOpenChange={(open) => !open && setRemoving(null)}
        size={'sm'}
        title={`Remove ${removing ?? ''} from the stop?`}
        returnFocus={headingRef}
        footer={(
          <React.Fragment>
            <Dialog.Cancel>Cancel</Dialog.Cancel>
            <Button onClick={handleRemove}>Remove</Button>
          </React.Fragment>
        )}
        labels={{ close: 'Close' }}
      >
        <p>It stays in the register, and can be added to another stop.</p>
      </Dialog>
    </Stack>
  );
}
