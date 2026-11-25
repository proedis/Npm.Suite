import * as React from 'react';

import { Table } from '@proedis/ui/data/table';
import { Stack } from '@proedis/ui/layout';

import type { TableStateChange, TableViewState } from '@proedis/ui/data/table';
import { ROUNDS_SORTING } from '../fixtures';

import { roundColumns, roundLabels } from './rounds';
import { useRounds } from './useRounds';


export default function Example(): React.ReactNode {

  /** The page holds the whole view: in an application, in its address */
  const [ view, setView ] = React.useState<TableViewState>({
    sorting         : ROUNDS_SORTING,
    pageIndex       : 0,
    pageSize        : 25,
    columnVisibility: {}
  });

  const [ lastChange, setLastChange ] = React.useState<TableStateChange | null>(null);

  const page = useRounds(view);

  const handleStateChange = React.useCallback((next: TableViewState, change: TableStateChange) => {
    setView(next);
    setLastChange(change);
  }, []);

  return (
    <Stack gap={3} className={'w-full'}>
      <Table
        caption={'Collection rounds'}
        columns={roundColumns}
        data={page.rows}
        rowCount={page.total}
        status={page.status}
        onRetry={page.retry}
        getRowId={(round) => round.id}
        state={view}
        onStateChange={handleStateChange}
        defaultSorting={ROUNDS_SORTING}
        labels={roundLabels}
      />

      <pre className={'overflow-x-auto rounded-md bg-muted px-3 py-2 font-mono text-xs text-muted-foreground'}>
        {`change: ${lastChange ?? 'none yet'}\nsorting: ${JSON.stringify(view.sorting)}\npage: ${view.pageIndex + 1}, ${view.pageSize} per page`}
      </pre>
    </Stack>
  );
}
