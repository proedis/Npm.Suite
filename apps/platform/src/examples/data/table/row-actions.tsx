import * as React from 'react';

import { Copy, Eye, MapPinned, Pencil, Trash2 } from 'lucide-react';

import { Table } from '@proedis/ui/data/table';
import { Stack } from '@proedis/ui/layout';

import type { TableRowActions } from '@proedis/ui/data/table';
import { ROUNDS } from '../fixtures';

import { roundColumns, roundLabels } from './rounds';

import type { Round } from '../fixtures';


const ROWS = ROUNDS.slice(0, 12);


export default function Example(): React.ReactNode {
  const [ done, setDone ] = React.useState<string | null>(null);

  /** The actions of one row, as data: the ⋯ lists them all, two of them sit on the row as icons */
  const rowActions = React.useCallback((round: Round): TableRowActions | null => {
    /* A cancelled round has nothing left to do: no ⋯, and the browser's own right click */
    if (round.status === 'cancelled') {
      return null;
    }

    return {
      inline : [ 'preview', 'edit' ],
      actions: [
        { id: 'preview', label: 'Preview', icon: <Eye />, onSelect: () => setDone(`Preview of ${round.code}`) },
        {
          id         : 'edit',
          label      : 'Edit',
          icon       : <Pencil />,
          disabled   : round.status === 'completed',
          description: round.status === 'completed' ? 'A completed round is read only' : undefined,
          onSelect   : () => setDone(`Editing ${round.code}`)
        },
        { id: 'map', label: 'Open on the map', icon: <MapPinned />, to: { href: `#map-${round.id}`, go: () => setDone(`Map of ${round.code}`) } },
        { id: 'duplicate', label: 'Duplicate', icon: <Copy />, onSelect: () => setDone(`Duplicating ${round.code}`) },
        { id: 'delete', label: 'Delete', icon: <Trash2 />, tone: 'destructive', onSelect: () => setDone(`Confirm the deletion of ${round.code}`) }
      ]
    };
  }, []);

  return (
    <Stack gap={3} className={'w-full'}>
      <Table
        caption={'Collection rounds'}
        mode={'client'}
        columns={roundColumns}
        data={ROWS}
        getRowId={(round) => round.id}
        rowActions={rowActions}
        labels={roundLabels}
      />

      <pre className={'rounded-md bg-muted px-3 py-2 font-mono text-xs text-muted-foreground'}>
        {`last action: ${done ?? 'none yet'}`}
      </pre>
    </Stack>
  );
}
