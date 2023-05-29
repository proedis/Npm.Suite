import * as React from 'react';

import type { AnyObject } from '@proedis/types';

import { Checkbox, MultiSelect, Select, TextInput } from '@mantine/core';

import { DatePickerInput } from '@mantine/dates';
import type { DatesRangeValue } from '@mantine/dates';

import { useRxTable } from '../RxTable.context';

import type { RxTableDataFilter } from '../lib/useDataFiltering';


/* --------
 * Component Interfaces
 * -------- */
export interface DataFilterElementProps {
  /** The column key */
  columnKey: string;

  /** Filter type */
  filter?: RxTableDataFilter<AnyObject>;
}


/* --------
 * Component Definition
 * -------- */
const DataFilterElement: React.FunctionComponent<DataFilterElementProps> = (props) => {

  const {
    columnKey,
    filter
  } = props;


  // ----
  // Get Context Props
  // ----
  const {
    filter: {
      current: filters,
      set    : setFilter
    }
  } = useRxTable();


  // ----
  // Handlers
  // ----
  const { type: filterType } = filter || {};
  const handleInputChange = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      setFilter(
        columnKey,
        (filterType === 'input' || filterType === 'regexp')
          ? (event.target.value || '') :
          !!event.target.checked
      );
    },
    [ columnKey, setFilter, filterType ]
  );

  const handleSelectChange = React.useCallback(
    (value: string | null) => {
      setFilter(columnKey, value || null);
    },
    [ columnKey, setFilter ]
  );

  const handleMultiSelectChange = React.useCallback(
    (value: string[]) => {
      setFilter(columnKey, Array.isArray(value) ? value : []);
    },
    [ columnKey, setFilter ]
  );

  const handleDateChange = React.useCallback(
    (date: Date | null) => {
      setFilter(columnKey, date || null);
    },
    [ columnKey, setFilter ]
  );

  const handleDatesRangeChange = React.useCallback(
    (dates: DatesRangeValue) => {
      setFilter(columnKey, Array.isArray(dates) ? dates : []);
    },
    [ columnKey, setFilter ]
  );


  // ----
  // Return empty component if no filter
  // ----
  if (!filter) {
    return null;
  }


  // ----
  // Return the right Filter Component
  // ----
  if (filter.type === 'input' || filter.type === 'regexp') {
    return (
      <TextInput
        {...filter.props}
        value={filters[columnKey] || ''}
        onChange={handleInputChange}
      />
    );
  }

  if (filter.type === 'checkbox') {
    return (
      <Checkbox
        {...filter.props}
        display={'inline-block'}
        checked={!!filters[columnKey]}
        onChange={handleInputChange}
      />
    );
  }

  if (filter.type === 'select') {
    return (
      <Select
        searchable={false}
        {...filter.props}
        value={filters[columnKey] ?? null}
        data={filter.data}
        clearable={true}
        onChange={handleSelectChange}
      />
    );
  }

  if (filter.type === 'multi-select') {
    return (
      <MultiSelect
        searchable={false}
        {...filter.props}
        value={Array.isArray(filters[columnKey]) ? filters[columnKey] : []}
        data={filter.data}
        clearable={true}
        onChange={handleMultiSelectChange}
      />
    );
  }

  if (filter.type === 'date') {
    return (
      <DatePickerInput
        {...filter.props}
        value={filters[columnKey] ?? null}
        clearable={true}
        onChange={handleDateChange}
      />
    );
  }

  if (filter.type === 'dates-range') {
    return (
      <DatePickerInput
        {...filter.props}
        allowSingleDateInRange={true}
        type={'range'}
        value={Array.isArray(filters[columnKey]) ? filters[columnKey] : [ null, null ]}
        clearable={true}
        onChange={handleDatesRangeChange}
      />
    );
  }


  // ----
  // Fallback to Null
  // ----
  return null;
};

DataFilterElement.displayName = 'DataFilterElement';

export default DataFilterElement;
