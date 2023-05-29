import * as React from 'react';

import { renderShorthandContent } from '@proedis/react';
import type { UIComponentProps } from '@proedis/react';

import { Box, createPolymorphicComponent } from '@mantine/core';

import useStyle from './TableRow.styles';
import type { TableRowStyleParams } from './TableRow.styles';


/* --------
 * Component Props
 * -------- */
export type TableRowProps = UIComponentProps<StrictTableRowProps>;

export interface StrictTableRowProps extends Partial<TableRowStyleParams> {
  /** Define a function to be call on element click */
  onClick?: React.MouseEventHandler<HTMLElement>;
}


/* --------
 * Intermediate Component Render Function
 * -------- */
const _TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  (props, ref) => {

    // ----
    // Props Deconstruct
    // ----
    const {
      children,
      content,

      className,

      clickable,
      color,

      onClick,

      ...rest
    } = props;


    // ----
    // Internal Hooks
    // ----
    const { classes, cx } = useStyle({
      clickable: !!clickable || typeof onClick === 'function',
      color
    }, {
      name: 'TableRow'
    });


    // ----
    // Component Render
    // ----
    return (
      <Box
        component={'tr'}
        ref={ref}
        {...rest}
        className={cx(classes.root, className)}
        onClick={onClick}
      >
        {renderShorthandContent({ children, content })}
      </Box>
    );

  }
);


/* --------
 * Polymorphic Component Definition
 * -------- */
const TableRow = (
  createPolymorphicComponent<'tr', TableRowProps>(_TableRow)
);

TableRow.displayName = 'TableRow';

export default TableRow;
