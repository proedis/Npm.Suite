import * as React from 'react';

import { FiltersBar } from '@proedis/ui/data/filters-bar';
import { Table } from '@proedis/ui/data/table';

import type { DateFilter, FilterOption } from '@proedis/ui/data/filters-bar';
import type { TableViewState } from '@proedis/ui/data/table';
import { DISTRICTS, PEOPLE, ROUNDS_SORTING } from '../fixtures';
import { filtersBarLabels } from '../labels';

import { roundColumns, roundLabels } from './rounds';
import { useRounds } from './useRounds';


/** A period, as the date filter holds it: either end may stay open */
type Period = DateFilter['value'];


const STATUS_OPTIONS: readonly FilterOption[] = [
  { value: 'planned', label: 'Planned' },
  { value: 'running', label: 'Running' },
  { value: 'completed', label: 'Completed' },
  { value: 'late', label: 'Late' },
  { value: 'cancelled', label: 'Cancelled' }
];

const DISTRICT_OPTIONS: readonly FilterOption[] = DISTRICTS.map((district) => ({ value: district, label: district }));

const DRIVER_OPTIONS: readonly FilterOption[] = PEOPLE.map((person) => ({ value: person.id, label: person.name }));

const NO_DATES: Period = { from: null, to: null };


export default function Example(): React.ReactNode {

  /* The page holds the filters and the view: in an application, both live in the address */
  const [ search, setSearch ] = React.useState('');
  const [ status, setStatus ] = React.useState<string[]>([]);
  const [ district, setDistrict ] = React.useState<string | null>(null);
  const [ driver, setDriver ] = React.useState<string[]>([]);
  const [ scheduled, setScheduled ] = React.useState<Period>(NO_DATES);

  const [ view, setView ] = React.useState<TableViewState>({
    sorting         : ROUNDS_SORTING,
    pageIndex       : 0,
    pageSize        : 25,
    columnVisibility: {}
  });

  const filters = React.useMemo(
    () => ({ search, status, district, driver, scheduled }),
    [ search, status, district, driver, scheduled ]
  );
  const page = useRounds(view, filters);

  /**
   * The signature of the filters and the search: when it changes, the table goes back to page 1 and
   * forgets the selection. Empty while no filter is on, which is how the table tells "no rounds at
   * all" from "no rounds with these filters"
   */
  const filtered = status.length > 0 || district !== null || driver.length > 0
    || scheduled.from !== null || scheduled.to !== null;
  const filterKey = filtered || search ? JSON.stringify({ search, status, district, driver, scheduled }) : '';

  const handleClear = React.useCallback(() => {
    setStatus([]);
    setDistrict(null);
    setDriver([]);
    setScheduled(NO_DATES);
  }, []);

  const handleClearAll = React.useCallback(() => {
    handleClear();
    setSearch('');
  }, [ handleClear ]);

  return (
    <Table
      caption={'Collection rounds'}
      columns={roundColumns}
      data={page.rows}
      rowCount={page.total}
      status={page.status}
      onRetry={page.retry}
      getRowId={(round) => round.id}
      state={view}
      onStateChange={setView}
      defaultSorting={ROUNDS_SORTING}
      filterKey={filterKey}
      searchActive={search !== ''}
      onClearFilters={handleClearAll}
      labels={roundLabels}
      className={'w-full'}
      toolbar={(
        <FiltersBar
          search={{ value: search, onValueChange: setSearch, label: 'Search rounds', placeholder: 'E.g. RD-24017' }}
          filters={[
            { id: 'status', label: 'Status', multiple: true, options: STATUS_OPTIONS, value: status, onValueChange: setStatus },
            { id: 'district', label: 'District', options: DISTRICT_OPTIONS, value: district, onValueChange: setDistrict },
            { id: 'driver', label: 'Driver', multiple: true, options: DRIVER_OPTIONS, value: driver, onValueChange: setDriver },
            { id: 'scheduled', label: 'Date', kind: 'date', value: scheduled, onValueChange: setScheduled }
          ]}
          onClear={handleClear}
          labels={filtersBarLabels}
        />
      )}
    />
  );
}
