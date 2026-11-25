import * as React from 'react';

import { Table } from '@proedis/ui/data/table';

import type { TableColumn, TableStatusTone } from '@proedis/ui/data/table';
import { ROUNDS } from '../fixtures';
import { tableLabels } from '../labels';

import type { Round, RoundStatus } from '../fixtures';


/** The tone of each status: what a dispatcher must see first is the round that is late */
const STATUS_TONE: Readonly<Record<RoundStatus, TableStatusTone>> = {
  planned  : { tone: 'secondary' },
  running  : { tone: 'info' },
  completed: { tone: 'success' },
  late     : { tone: 'warning', fill: 'solid' },
  cancelled: { tone: 'muted' }
};

/** The columns of the entity, written once in its module: every list of rounds reads them */
const COLUMNS: readonly TableColumn<Round>[] = [
  { id: 'code', header: 'Round', kind: 'code', width: 'sm', sortable: true },
  { id: 'district', header: 'District', kind: 'reference', width: 'fill', sortable: true },
  {
    id      : 'driver',
    header  : 'Driver',
    kind    : 'person',
    width   : 'lg',
    sortable: true,
    accessor: (round) => ({ avatar: round.driver.avatar, name: round.driver.name })
  },
  { id: 'status', header: 'Status', kind: 'status', width: 'md', sortable: true, tone: (value) => STATUS_TONE[value as RoundStatus] },
  { id: 'scheduledAt', header: 'Date', kind: 'date', width: 'md', sortable: true },
  { id: 'stops', header: 'Stops', kind: 'number', width: 'xs', sortable: true },
  { id: 'weightKg', header: 'Collected', kind: 'number', format: 'weight', width: 'md', sortable: true }
];

const LABELS = tableLabels<Round>({ one: 'round', many: 'rounds' }, (round) => round.code);

/** Forty rounds, all in memory: the table sorts and pages them itself */
const ROWS = ROUNDS.slice(0, 40);


export default function Example(): React.ReactNode {
  return (
    <Table
      caption={'Collection rounds'}
      mode={'client'}
      columns={COLUMNS}
      data={ROWS}
      getRowId={(round) => round.id}
      defaultSorting={[ { id: 'scheduledAt', desc: true } ]}
      labels={LABELS}
      className={'w-full'}
    />
  );
}
