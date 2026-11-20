/**
 * @proedis/ui/data/table
 *
 * `Table`, the table of every list, with `TableFormatsProvider` (how the values of the kinds read) and
 * `sortingToFields` (the order as the server wants it). Runs on `@tanstack/react-table` and
 * `@base-ui/react`, optional peers of this package.
 */

export * from './Table';

export * from './tableFormats';

export { sortingToFields } from './tableState';

export type * from './tableTypes';
