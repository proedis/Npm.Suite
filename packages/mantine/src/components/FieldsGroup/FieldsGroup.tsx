import * as React from 'react';

import { Box, createPolymorphicComponent, createStyles, useComponentDefaultProps } from '@mantine/core';

import { renderShorthandContent } from '@proedis/react';

import type { FieldsGroupProps } from './FieldsGroup.types';


/* --------
 * Styles Definition
 * -------- */
const useStyles = createStyles((theme) => ({

  root: {
    '& > :not([hidden])~:not([hidden])': {
      marginTop: theme.spacing.lg
    }
  }

}));


/* --------
 * Component Definition
 * -------- */
const _FieldsGroup = React.forwardRef<HTMLDivElement, FieldsGroupProps>((props, ref) => {

  // ----
  // Props Deconstruct
  // ----
  const {
    children,
    content,
    className,

    ...rest
  } = useComponentDefaultProps('FieldsGroup', {}, props);


  // ----
  // Internal Hooks
  // ----
  const { classes, cx } = useStyles();


  // ----
  // Component Render
  // ----
  return (
    <Box component={'div'} ref={ref} className={cx(classes.root, className)} {...rest}>
      {renderShorthandContent({ children, content })}
    </Box>
  );

});

const FieldsGroup = createPolymorphicComponent<'div', FieldsGroupProps>(_FieldsGroup);

export default FieldsGroup;
