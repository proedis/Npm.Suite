import * as React from 'react';

import { sortingToFields } from '@proedis/ui/data/table';

import type { TableStatus, TableViewState } from '@proedis/ui/data/table';
import { fetchRounds } from '../fixtures';

import { roundColumns } from './rounds';

import type { Round, RoundsQuery } from '../fixtures';


/*
 * The stand-in for an application's query hook (TanStack Query, in a Proedis frontend): it asks the
 * simulated server for one page and keeps the previous one on screen while the next arrives, which is
 * what tells the table `fetching` from `loading`.
 */


/* --------
 * Types Definition
 * -------- */

export type RoundsFilters = Omit<RoundsQuery, 'sorting' | 'pageIndex' | 'pageSize'>;

interface Answer {
  readonly key: string;
  readonly rows: readonly Round[];
  readonly total: number;
  readonly failed: boolean;
}

export interface RoundsPage {
  readonly rows: readonly Round[];
  readonly total: number;
  readonly status: TableStatus;
  readonly retry: () => void;
}


/* --------
 * Hook Definition
 * -------- */

export function useRounds(view: TableViewState, filters: RoundsFilters = {}, options: { fail?: boolean } = {}): RoundsPage {

  // ----
  // Internal State
  // ----

  /** The last answer, with the request it answered: a request without its answer is a wait */
  const [ answer, setAnswer ] = React.useState<Answer | null>(null);
  const [ attempt, setAttempt ] = React.useState(0);


  // ----
  // Memoized Data
  // ----

  /** One key per distinct request: the order as the server wants it, the page, the filters */
  const key = JSON.stringify({
    sorting  : sortingToFields(view.sorting, roundColumns),
    pageIndex: view.pageIndex,
    pageSize : view.pageSize,
    filters,
    fail     : options.fail,
    attempt
  });


  // ----
  // Lifecycle Events
  // ----
  React.useEffect(() => {
    let current = true;
    const query = JSON.parse(key) as Omit<RoundsQuery, keyof RoundsFilters> & { filters: RoundsFilters; fail?: boolean };

    fetchRounds({ ...query.filters, sorting: query.sorting, pageIndex: query.pageIndex, pageSize: query.pageSize })
      .then((result) => {
        if (current) {
          /* A failed answer keeps the rows already on screen, as a query library keeps its last data */
          setAnswer((previous) => (query.fail
            ? { key, rows: previous?.rows ?? [], total: previous?.total ?? 0, failed: true }
            : { key, rows: result.rows, total: result.total, failed: false }));
        }
      });

    return () => {
      current = false;
    };
  }, [ key ]);


  // ----
  // Layout Computation
  // ----
  const settled = answer?.key === key;

  let status: TableStatus = 'ready';

  if (!settled) {
    status = answer && answer.rows.length > 0 ? 'fetching' : 'loading';
  }
  else if (answer.failed) {
    status = 'error';
  }


  // ----
  // Handlers
  // ----
  const retry = React.useCallback(() => setAttempt((value) => value + 1), []);


  // ----
  // Hook Return
  // ----
  return { rows: answer?.rows ?? [], total: answer?.total ?? 0, status, retry };
}
