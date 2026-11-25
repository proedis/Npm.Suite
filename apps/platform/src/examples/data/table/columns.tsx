import * as React from 'react';

import { Table } from '@proedis/ui/data/table';

import type { TableColumn } from '@proedis/ui/data/table';
import { ROUNDS } from '../fixtures';

import { roundLabels } from './rounds';

import type { Round } from '../fixtures';


/** The widths of the steps, a column that takes the rest, and two columns the user shows when needed */
const COLUMNS: readonly TableColumn<Round>[] = [
  { id: 'code', header: 'Round', kind: 'code', width: 'sm' },
  { id: 'district', header: 'District', kind: 'reference', width: 'fill' },
  { id: 'vehicle', header: 'Vehicle', kind: 'text', width: 'sm' },
  { id: 'stops', header: 'Stops', kind: 'number', width: 'xs' },
  { id: 'distanceKm', header: 'Distance', kind: 'number', format: 'distance', width: 'sm', defaultHidden: true },
  { id: 'costEur', header: 'Cost', kind: 'number', format: 'currency', width: 'sm', defaultHidden: true },
  { id: 'notes', header: 'Notes', kind: 'text', width: 'lg', hideable: false }
];

const ROWS = ROUNDS.slice(0, 6);


export default function Example(): React.ReactNode {
  return (
    <Table
      caption={'Collection rounds'}
      mode={'client'}
      columns={COLUMNS}
      data={ROWS}
      getRowId={(round) => round.id}
      labels={roundLabels}
      className={'w-full'}
    />
  );
}
