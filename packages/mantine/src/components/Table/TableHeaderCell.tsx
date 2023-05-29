import * as React from 'react';

import type { UIComponentProps } from '@proedis/react';

import { createPolymorphicComponent, useComponentDefaultProps } from '@mantine/core';

import type { IconName } from '@fortawesome/fontawesome-common-types';

import useStyle from './TableHeaderCell.styles';

import Icon from '../Icon';

import TableCell from './TableCell';
import type { TableCellProps } from './TableCell';


/* --------
 * Component Props
 * -------- */
export type TableHeaderCellProps = UIComponentProps<StrictTableHeaderCellProps, TableCellProps>;

export interface StrictTableHeaderCellProps {
  /** Icon to render while sorting data in 'asc' direction */
  ascSortingIcon?: IconName;

  /** Icon to render while sorting data in 'desc' direction */
  descSortingIcon?: IconName;

  /** Icon to render while data is not sorting */
  notSortedIcon?: IconName;

  /** Add the sortable style */
  sortable?: boolean;

  /** Set the sorted direction */
  sorted?: 'desc' | 'asc';
}


/* --------
 * Table Header Cell Default Props
 * -------- */
const defaultProps: Partial<TableHeaderCellProps> = {
  ascSortingIcon : 'arrow-down',
  descSortingIcon: 'arrow-up',
  notSortedIcon  : 'arrow-up-arrow-down'
};


/* --------
 * Intermediate Component Render Function
 * -------- */
const _TableHeaderCell = React.forwardRef<HTMLTableHeaderCellElement, TableHeaderCellProps>(
  (props, ref) => {

    // ----
    // Props Deconstruct
    // ----
    const {
      // @ts-ignore
      className,

      sortable,
      sorted,
      ascSortingIcon,
      descSortingIcon,
      notSortedIcon,

      header: userDefinedHeader,

      ...rest
    } = useComponentDefaultProps('TableHeaderCell', defaultProps, props);


    // ----
    // Internal Hooks
    // ----
    const { classes, cx } = useStyle();


    // ----
    // Memoized Component
    // ----
    const sortableIconElement = React.useMemo(
      () => {
        /** If not sortable return null */
        if (!sortable) {
          return null;
        }

        /** If not sorted, return default icon */
        if (!sorted) {
          return Icon.create(notSortedIcon, { autoGenerateKey: false });
        }

        /** Return icon depending on sorting */
        return Icon.create(sorted === 'desc' ? descSortingIcon : ascSortingIcon, { autoGenerateKey: false });
      },
      [ sortable, sorted, notSortedIcon, ascSortingIcon, descSortingIcon ]
    );


    // ----
    // Component Render
    // ----
    return (
      <TableCell
        component={'th'}
        ref={ref}
        {...rest}
        className={cx(classes.root, className)}
        header={(
          <React.Fragment>
            {sortableIconElement}
            {userDefinedHeader && (<span>{userDefinedHeader}</span>)}
          </React.Fragment>
        )}
        data-sortable={sortable || undefined}
        data-sorted={sorted || undefined}
      />
    );

  }
);


/* --------
 * Polymorphic Component Definition
 * -------- */
const TableHeaderCell = (
  createPolymorphicComponent<'th', TableHeaderCellProps>(_TableHeaderCell)
);

TableHeaderCell.displayName = 'TableHeaderCell';

export default TableHeaderCell;
