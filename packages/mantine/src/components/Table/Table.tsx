import * as React from 'react';

import { Box, createPolymorphicComponent, useComponentDefaultProps } from '@mantine/core';

import type { UIComponentProps } from '@proedis/react';

import createTableSection from './lib/createTableSection';

import useStyle from './Table.styles';
import type { TableStyleParams } from './Table.styles';

import { TABLE_REFS } from './Table.constants';

import TableCell from './TableCell';
import TableHeaderCell from './TableHeaderCell';
import TableRow from './TableRow';


/* --------
 * Component Props
 * -------- */
export type TableProps = UIComponentProps<StrictTableProps>;

export interface StrictTableProps extends Partial<TableStyleParams> {
  /** Add borders all around the table */
  bordered?: boolean;

  /** Divide all rows and columns using a line */
  divided?: boolean;

  /** Wrap the table into a scrollable container */
  responsive?: boolean;

  /** Define solid table, adding background and shadow */
  solid?: boolean;

  /** Stripe the color of the odd row */
  striped?: boolean;
}


/* --------
 * Intermediate Component Render Function
 * -------- */
const _Table = React.forwardRef<HTMLTableElement, TableProps>(
  (props, ref) => {

    // ----
    // Props Deconstruct
    // ----
    const {
      children,
      content,

      className,

      bordered,
      divided,
      responsive,
      solid,
      striped,

      borderColor,
      horizontalSpacing,
      layout,
      verticalSpacing,

      ...rest

    } = useComponentDefaultProps('Table', {}, props);


    // ----
    // Internal Hooks
    // ----
    const { classes, cx } = useStyle({
      borderColor      : borderColor ?? 'cloud.2',
      horizontalSpacing: horizontalSpacing ?? 'md',
      verticalSpacing  : verticalSpacing ?? 'sm',
      layout           : layout ?? 'auto'
    }, {
      name: 'Table'
    });


    // ----
    // Component Render
    // ----
    return (
      <Box
        component={'table'}
        ref={ref}
        {...rest}
        className={cx(classes.root, className)}
        data-bordered={bordered || undefined}
        data-divided={divided || undefined}
        data-responsive={responsive || undefined}
        data-solid={solid || undefined}
        data-striped={striped || undefined}
      >
        {children || content}
      </Box>
    );

  }
);


/* --------
 * Child Component Definition
 * -------- */
const TableHeader = createTableSection('TableHeader', 'thead', TABLE_REFS.HEADER);
const TableBody = createTableSection('TableBody', 'tbody', TABLE_REFS.BODY);
const TableFooter = createTableSection('TableFooter', 'tfoot', TABLE_REFS.FOOTER);


/* --------
 * Polymorphic Component Definition
 * -------- */
type TableComponentChild = {
  Header: typeof TableHeader;
  Body: typeof TableBody;
  Footer: typeof TableFooter;
  Row: typeof TableRow;
  HeaderCell: typeof TableHeaderCell;
  Cell: typeof TableCell;
};

const Table = (
  createPolymorphicComponent<'table', TableProps, TableComponentChild>(_Table)
);

Table.displayName = 'Table';

Table.Header = TableHeader;
Table.Body = TableBody;
Table.Footer = TableFooter;
Table.Row = TableRow;
Table.HeaderCell = TableHeaderCell;
Table.Cell = TableCell;

export default Table;
