import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { Cluster } from '@proedis/ui/layout';
import { Dialog } from '@proedis/ui/overlays/dialog';

import type { DialogSize } from '@proedis/ui/overlays/dialog';


const WIDTHS: Readonly<Record<DialogSize, string>> = {
  sm: '400px: a confirmation, a choice between a few options, one or two fields.',
  md: '560px, the default: a form of a few rows, a detail to read.',
  lg: '800px: a long form, a selector with a table, sections with an index.'
};


export default function Example(): React.ReactNode {
  const [ size, setSize ] = React.useState<DialogSize | null>(null);

  const handleOpenChange = React.useCallback((open: boolean) => {
    if (!open) {
      setSize(null);
    }
  }, []);

  return (
    <Cluster gap={3}>
      {(Object.keys(WIDTHS) as DialogSize[]).map((key) => (
        <Button key={key} fill={'soft'} tone={'secondary'} onClick={() => setSize(key)}>
          Open {key}
        </Button>
      ))}

      <Dialog
        open={size !== null}
        onOpenChange={handleOpenChange}
        size={size ?? 'md'}
        title={`The ${size ?? 'md'} dialog`}
        labels={{ close: 'Close' }}
      >
        <p>{WIDTHS[size ?? 'md']}</p>
        <p className={'text-muted-foreground'}>On a narrow window every size takes the width there is, minus 16px on each side.</p>
      </Dialog>
    </Cluster>
  );
}
