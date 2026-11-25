import type { TableColumn, TableStatusTone } from '@proedis/ui/data/table';
import { tableLabels } from '../labels';

import type { Round, RoundStatus } from '../fixtures';


/*
 * The module of an entity declares its columns, its status tones and its texts once, and every list
 * of that entity reads them: the page only says which rows and which state.
 */


/* --------
 * Constants Definition
 * -------- */

/** The tone of each status: what a dispatcher must see first is the round that is late */
export const ROUND_STATUS_TONE: Readonly<Record<RoundStatus, TableStatusTone>> = {
  planned  : { tone: 'secondary' },
  running  : { tone: 'info' },
  completed: { tone: 'success' },
  late     : { tone: 'warning', fill: 'solid' },
  cancelled: { tone: 'muted' }
};

/** The columns of a list of rounds, in order. The page passes the same array every render */
export const roundColumns: readonly TableColumn<Round>[] = [
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
  { id: 'status', header: 'Status', kind: 'status', width: 'md', sortable: true, tone: (value) => ROUND_STATUS_TONE[value as RoundStatus] },
  { id: 'scheduledAt', header: 'Date', kind: 'date', width: 'md', sortable: true },
  { id: 'stops', header: 'Stops', kind: 'number', width: 'xs', sortable: true },
  { id: 'weightKg', header: 'Collected', kind: 'number', format: 'weight', width: 'md', sortable: true }
];

export const roundLabels = tableLabels<Round>({ one: 'round', many: 'rounds' }, (round) => round.code);
