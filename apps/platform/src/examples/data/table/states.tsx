import * as React from 'react';

import { Route } from 'lucide-react';

import { SegmentedControl } from '@proedis/ui/actions/segmented-control';
import { Table } from '@proedis/ui/data/table';
import { Stack } from '@proedis/ui/layout';

import type { TableStatus } from '@proedis/ui/data/table';
import { ROUNDS } from '../fixtures';

import { roundColumns, roundLabels } from './rounds';

import type { Round } from '../fixtures';


type Scene = 'loading' | 'fetching' | 'error' | 'invalid' | 'first-use' | 'no-results';

/** What each scene passes to the table: the rows, the status, the error and whether a filter is on */
interface SceneProps {
  rows: readonly Round[];
  status: TableStatus;
  retryable?: boolean;
  filterKey?: string;
}

const SCENES: Readonly<Record<Scene, SceneProps>> = {
  loading   : { rows: [], status: 'loading' },
  fetching  : { rows: ROUNDS.slice(0, 6), status: 'fetching' },
  error     : { rows: [], status: 'error', retryable: true },
  invalid   : { rows: [], status: 'error', retryable: false, filterKey: 'district=Atlantis' },
  'first-use' : { rows: [], status: 'ready' },
  'no-results': { rows: [], status: 'ready', filterKey: 'status=late' }
};


export default function Example(): React.ReactNode {
  const [ scene, setScene ] = React.useState<Scene>('loading');
  const current = SCENES[scene];

  return (
    <Stack gap={4} className={'w-full'}>
      <SegmentedControl aria-label={'State of the table'} value={scene} onValueChange={(value) => setScene(value as Scene)} size={'sm'}>
        <SegmentedControl.Item value={'loading'}>First load</SegmentedControl.Item>
        <SegmentedControl.Item value={'fetching'}>Fetching</SegmentedControl.Item>
        <SegmentedControl.Item value={'error'}>Error</SegmentedControl.Item>
        <SegmentedControl.Item value={'invalid'}>Invalid view</SegmentedControl.Item>
        <SegmentedControl.Item value={'first-use'}>First use</SegmentedControl.Item>
        <SegmentedControl.Item value={'no-results'}>No results</SegmentedControl.Item>
      </SegmentedControl>

      <Table
        caption={'Collection rounds'}
        columns={roundColumns}
        data={current.rows}
        rowCount={current.rows.length}
        status={current.status}
        error={current.retryable === undefined ? undefined : { retryable: current.retryable }}
        onRetry={() => setScene('fetching')}
        filterKey={current.filterKey}
        onClearFilters={() => setScene('first-use')}
        empty={{
          icon       : <Route />,
          title      : 'No round planned yet',
          description: 'A round groups the stops a vehicle collects in one shift.',
          action     : { label: 'Plan a round', onClick: () => setScene('fetching') }
        }}
        getRowId={(round) => round.id}
        labels={roundLabels}
      />
    </Stack>
  );
}
