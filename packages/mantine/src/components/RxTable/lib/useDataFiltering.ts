import * as React from 'react';

import type { AnyObject } from '@proedis/types';

import type {
  CheckboxProps,
  MultiSelectProps,
  SelectProps,
  TextInputProps
} from '@mantine/core';

import type { DatePickerInputProps, DatesRangeValue } from '@mantine/dates';

import type { RxTableColumn } from './useColumns';


/* --------
 * Filters Type
 * -------- */
interface RxTableDataFilterTypeProps {
  /** Exposed Checkbox Props */
  checkbox: Omit<CheckboxProps, 'checked' | 'defaultChecked' | 'onChange'>;

  /** Exposed Date Props */
  date: Omit<DatePickerInputProps, 'type' | 'clearable' | 'value' | 'defaultValue' | 'onChange'>;

  /** Exposed DatesRange Props */
  'dates-range': Omit<DatePickerInputProps<'range'>, 'type' | 'clearable' | 'value' | 'defaultValue' | 'onChange'>;

  /** Exposed Input Props */
  input: Omit<TextInputProps, 'value' | 'defaultValue' | 'onChange'>;

  /** Exposed MultiSelect Props */
  'multi-select': Omit<MultiSelectProps, 'data' | 'value' | 'defaultValue' | 'clearable' | 'onChange'>;

  /** Exposed Regex Props */
  regexp: Omit<TextInputProps, 'value' | 'defaultValue' | 'onChange'>;

  /** Exposed Select Props */
  select: Omit<SelectProps, 'data' | 'value' | 'defaultValue' | 'clearable' | 'onChange'>;
}

interface RxTableBaseDataFilter<Data extends AnyObject, V, T extends keyof RxTableDataFilterTypeProps> {
  /** The filter initial default value at first render */
  initialValue?: V;

  /** The type of the filter, used to infer component props */
  type: T;

  /** Extra user defined prop to pass to filter controller */
  props?: Partial<RxTableDataFilterTypeProps[T]>;

  /** The function that will be used for each row element to check if it is matching the filter or not */
  show: (value: V, row: Data, index: number, data: Data[]) => boolean;
}

export type RxTableDataFilter<Data extends AnyObject> =
  | RxTableBaseDataFilter<Data, boolean, 'checkbox'>
  | RxTableBaseDataFilter<Data, Date, 'date'>
  | RxTableBaseDataFilter<Data, DatesRangeValue, 'dates-range'>
  | RxTableBaseDataFilter<Data, string, 'input'>
  | (RxTableBaseDataFilter<Data, string[], 'multi-select'> & { data: { value: string, label: string }[] })
  | (RxTableBaseDataFilter<Data, RegExp, 'regexp'> & { flags?: string })
  | (RxTableBaseDataFilter<Data, string, 'select'> & { data: { value: string, label: string }[] });


/* --------
 * Internal Types
 * -------- */
export interface UseDataFiltering<Data extends AnyObject> {
  /** Columns Array */
  columns: RxTableColumn<Data>[];

  /** The filter logic to apply */
  filterLogic?: 'and' | 'or';
}

type UseDataFilteringAndData<Data extends AnyObject> = UseDataFiltering<Data> & {
  /** Data to filter */
  data: Data[];
};

export interface DataFiltered<Data extends AnyObject> {
  /** Filtered Data */
  filteredData: Data[];

  /** Current filters */
  filters: Record<string, any>;

  /** Set filter at column */
  setFilter: (columnKey: string, value: any) => void;
}


/* --------
 * Hook Definition
 * -------- */
export default function useDataFiltering<Data extends AnyObject>(
  enabled: boolean,
  config: UseDataFilteringAndData<Data>
): DataFiltered<Data> {

  const {
    columns,
    data,
    filterLogic = 'and'
  } = config;


  // ----
  // Internal State
  // ----
  const [ filters, setFilteringValues ] = React.useState<Record<string, any>>(
    columns.reduce<Record<string, any>>(
      (acc, column) => {
        if (column.filter) {
          acc[column.key] = column.filter.initialValue;
        }

        return acc;
      },
      {}
    )
  );


  // ----
  // Handlers
  // ----
  const setFilter = React.useCallback(
    (columnKey: string, value: any) => {
      setFilteringValues((curr) => ({
        ...curr,
        [columnKey]: value
      }));
    },
    [ setFilteringValues ]
  );


  // ----
  // Filtering Data
  // ----
  const filteredData = React.useMemo<Data[]>(
    () => {
      /** If no filter, return entire data */
      if (!enabled) {
        return data;
      }

      /** Init a regexp pool to save regexp once per time */
      const regExpPool: Record<string, RegExp> = {};

      /** Get only filter columns */
      const filterColumns = columns.filter((column) => {
        if (!column.filter) {
          return false;
        }

        if (column.filter.type === 'input') {
          return typeof filters[column.key] === 'string' && !!filters[column.key].length;
        }

        if (column.filter.type === 'regexp') {
          /** Get current value */
          const value = filters[column.key];

          /** If is invalid, abort */
          if (typeof value !== 'string' || !value.length) {
            return false;
          }

          /** If the value is valid, save the regexp into pool */
          regExpPool[column.key] = new RegExp(
            value
              .replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
              .replace(/-/g, '\\x2d'),
            column.filter.flags || 'i'
          );

          return true;
        }

        if (column.filter.type === 'checkbox') {
          return typeof filters[column.key] === 'boolean' && !!filters[column.key];
        }

        if (column.filter.type === 'select') {
          return filters[column.key] !== null && filters[column.key] !== undefined;
        }

        if (column.filter.type === 'multi-select') {
          return Array.isArray(filters[column.key]) && filters[column.key].length > 0;
        }

        if (column.filter.type === 'date') {
          return !!filters[column.key] && filters[column.key] instanceof Date;
        }

        if (column.filter.type === 'dates-range') {
          return Array.isArray(filters[column.key]) &&
            !!filters[column.key][0] && filters[column.key][0] instanceof Date &&
            !!filters[column.key][1] && filters[column.key][1] instanceof Date;
        }

        return false;
      });

      /** If no columns are able to filter data, return the entire data set */
      if (!filterColumns.length) {
        return data;
      }

      /** Filter data using columns */
      return data.filter((row, index, array) => {
        return filterColumns.reduce(
          (show: boolean, next: RxTableColumn<Data>) => {
            /** Assert filter realy exists */
            if (!next.filter) {
              return show;
            }

            /** Get the filter show value */
            const couldShowNext = next.filter.type === 'regexp'
              ? !!regExpPool[next.key] ? next.filter.show(regExpPool[next.key], row, index, array) : true
              : next.filter.show(filters[next.key] as (string & number), row, index, array);

            /** Concatenate result */
            return filterLogic === 'and'
              ? show && couldShowNext
              : show || couldShowNext;
          },
          filterLogic === 'and'
        );
      });
    },
    [
      columns,
      data,
      filterLogic,
      filters,
      enabled
    ]
  );


  // ----
  // Return tools
  // ----
  return {
    filteredData,
    filters,
    setFilter
  };

}
