import * as React from 'react';

import { renderShorthandContent } from '@proedis/react';
import type { UIComponentProps } from '@proedis/react';

import { Box, Flex, createPolymorphicComponent, useComponentDefaultProps } from '@mantine/core';

import useStyle from './TableCell.styles';
import type { TableCellStyleParams } from './TableCell.styles';

import Icon from '../Icon';
import type { ShorthandIcon } from '../Icon';


/* --------
 * Component Props
 * -------- */
export type TableCellProps = UIComponentProps<StrictTableCellProps>;

export interface StrictTableCellProps extends Partial<TableCellStyleParams> {
  /** Set colSpan */
  colSpan?: number;

  /** Define the primary cell content text */
  header?: React.ReactNode;

  /** Define an icon to be showed next to text */
  icon?: ShorthandIcon;

  /** Define a meta content for cell, rendered over the header */
  meta?: React.ReactNode;

  /** Define an onClick function */
  onClick?: React.MouseEventHandler<HTMLElement>;

  /** Add style to the component */
  style?: React.CSSProperties;
}


/* --------
 * Intermediate Component Render Function
 * -------- */
const _TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  (props, ref) => {

    // ----
    // Props Deconstruct
    // ----
    const {
      children,
      content,

      className,

      colSpan,
      header,
      icon,
      meta,

      align,
      color,
      truncate,

      ...rest
    } = useComponentDefaultProps('TableCell', {}, props);


    // ----
    // Internal Hooks
    // ----
    const { classes, cx } = useStyle({
      align   : align ?? 'left',
      color,
      truncate: !!truncate
    }, {
      name: 'TableCell'
    });


    // ----
    // Memoized Content
    // ----
    const iconElement = React.useMemo(
      () => Icon.create(icon, {
        autoGenerateKey: false,
        defaultProps   : {
          color,
          fz: 'lg'
        }
      }),
      [ icon, color ]
    );


    // ----
    // Plain Element
    // ----
    const metaElement = !!meta && (
      <span className={cx(classes.text, classes.meta)}>{meta}</span>
    );

    const headerElement = !!header && (
      <span className={cx(classes.text, classes.header)}>{header}</span>
    );

    const contentElement = !!(content || children) && (
      <span className={cx(classes.text, classes.content)}>
        {renderShorthandContent({ children, content })}
      </span>
    );


    // ----
    // Component Render
    // ----
    return (
      <Box
        component={'td'}
        ref={ref}
        {...rest}
        className={cx(classes.root, className)}
        colSpan={colSpan}
      >
        <Flex
          direction={'row'}
          justify={(
            align === 'right'
              ? 'flex-end'
              : align === 'center'
                ? 'center'
                : 'flex-start'
          )}
          gap={'sm'}
          align={'center'}
        >
          {iconElement}
          <div className={classes.contentWrapper}>
            {metaElement}
            {headerElement}
            {contentElement}
          </div>
        </Flex>
      </Box>
    );

  }
);


/* --------
 * Polymorphic Component Definition
 * -------- */
const TableCell = (
  createPolymorphicComponent<'td', TableCellProps>(_TableCell)
);

TableCell.displayName = 'TableCell';

export default TableCell;
