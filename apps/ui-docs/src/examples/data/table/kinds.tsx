import * as React from 'react';

import { Table } from '@proedis/ui/data/table';

import type { TableColumn } from '@proedis/ui/data/table';
import { ROUNDS } from '../fixtures';
import { tableLabels } from '../labels';

import type { Round } from '../fixtures';


/** One column of every kind, and the number formats side by side */
const COLUMNS: readonly TableColumn<Round>[] = [
  { id: 'code', header: 'code', kind: 'code', width: 'sm', target: (round) => ({ href: `#${round.id}`, go: () => undefined }) },
  { id: 'district', header: 'reference', kind: 'reference', width: 'md', target: (round) => ({ href: `#${round.district}`, go: () => undefined }) },
  {
    id      : 'driver',
    header  : 'person',
    kind    : 'person',
    width   : 'md',
    accessor: (round) => ({ avatar: round.driver.avatar, name: round.driver.name })
  },
  {
    id      : 'crew',
    header  : 'person, a group',
    kind    : 'person',
    width   : 'sm',
    group   : (items) => ({ label: `Crew: ${items.length} operators`, title: 'Crew' })
  },
  { id: 'vehicle', header: 'text', kind: 'text', width: 'sm' },
  { id: 'status', header: 'enum', kind: 'enum', width: 'md' },
  { id: 'statusBadge', header: 'status', kind: 'status', width: 'md', accessor: 'status', tone: () => ({ tone: 'info' }) },
  { id: 'scheduledAt', header: 'date', kind: 'date', width: 'md' },
  { id: 'startedAt', header: 'datetime', kind: 'datetime', width: 'md' },
  { id: 'stops', header: 'integer', kind: 'number', width: 'xs' },
  { id: 'weightKg', header: 'weight', kind: 'number', format: 'weight', width: 'sm' },
  { id: 'distanceKm', header: 'distance', kind: 'number', format: 'distance', width: 'sm' },
  { id: 'fillRate', header: 'percentage', kind: 'number', format: 'percentage', width: 'sm' },
  { id: 'durationMin', header: 'duration', kind: 'number', format: 'duration', width: 'sm' },
  { id: 'costEur', header: 'currency', kind: 'number', format: 'currency', width: 'sm' },
  { id: 'electric', header: 'boolean', kind: 'boolean', width: 'xs' },
  {
    id    : 'notes',
    header: 'custom',
    kind  : 'custom',
    width : 'lg',
    cell  : (round) => (round.notes ? <em className={'text-muted-foreground'}>{round.notes}</em> : null)
  }
];

/** Eight rounds, electric and not, planned and done: every kind shows a value and an empty one */
const ROWS = [
  ...ROUNDS.filter((round) => round.electric).slice(0, 3),
  ...ROUNDS.filter((round) => !round.electric).slice(0, 5)
];

const LABELS = tableLabels<Round>({ one: 'round', many: 'rounds' }, (round) => round.code);


export default function Example(): React.ReactNode {
  return (
    <Table
      caption={'Every kind of column'}
      mode={'client'}
      columns={COLUMNS}
      data={ROWS}
      getRowId={(round) => round.id}
      labels={LABELS}
      className={'w-full'}
    />
  );
}
