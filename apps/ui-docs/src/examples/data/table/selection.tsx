import * as React from 'react';

import { Archive, Printer, Trash2, UserRoundPen } from 'lucide-react';

import { Table } from '@proedis/ui/data/table';
import { Stack } from '@proedis/ui/layout';

import type { TableSelection, TableSelectionAction } from '@proedis/ui/data/table';
import { ROUNDS, ROUNDS_SORTING } from '../fixtures';

import { roundColumns, roundLabels } from './rounds';

import type { Round } from '../fixtures';


const ROWS = ROUNDS.slice(0, 120);

/** What each action would do with the selection: here it only says it */
function describe(selection: TableSelection): string {
  return selection.all
    ? `every round of the filter but ${selection.excludedIds.length}`
    : `${selection.ids.length} rounds`;
}


export default function Example(): React.ReactNode {
  const [ selection, setSelection ] = React.useState<TableSelection>({ ids: [] });
  const [ done, setDone ] = React.useState<string | null>(null);

  const actions = React.useMemo<TableSelectionAction[]>(() => [
    { id: 'print', label: 'Print the sheets', icon: <Printer />, supportsAll: true, onSelect: (chosen) => setDone(`Printing ${describe(chosen)}`) },
    { id: 'driver', label: 'Change driver', icon: <UserRoundPen />, supportsAll: true, onSelect: (chosen) => setDone(`New driver for ${describe(chosen)}`) },
    { id: 'archive', label: 'Archive', icon: <Archive />, supportsAll: true, onSelect: (chosen) => setDone(`Archiving ${describe(chosen)}`) },
    {
      id         : 'delete',
      label      : 'Delete',
      menuLabel  : (count) => `Delete ${count} rounds`,
      icon       : <Trash2 />,
      tone       : 'destructive',
      supportsAll: true,
      onSelect   : (chosen) => setDone(`Asking to confirm the deletion of ${describe(chosen)}`)
    }
  ], []);

  /** A round already on the road cannot be chosen, and the checkbox says why */
  const enableRowSelection = React.useCallback((round: Round) => (
    round.status === 'running' ? 'A running round cannot be changed' : true
  ), []);

  return (
    <Stack gap={3} className={'w-full'}>
      <Table
        caption={'Collection rounds'}
        mode={'client'}
        columns={roundColumns}
        data={ROWS}
        getRowId={(round) => round.id}
        defaultSorting={ROUNDS_SORTING}
        defaultState={{ pageSize: 25 }}
        selectionActions={actions}
        inlineSelectionActions={[ 'print', 'driver' ]}
        selection={selection}
        onSelectionChange={setSelection}
        enableRowSelection={enableRowSelection}
        labels={roundLabels}
      />

      <pre className={'overflow-x-auto rounded-md bg-muted px-3 py-2 font-mono text-xs text-muted-foreground'}>
        {`selection: ${JSON.stringify(selection)}${done ? `\nlast action: ${done}` : ''}`}
      </pre>
    </Stack>
  );
}
