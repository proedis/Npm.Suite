import * as React from 'react';

import { Flex, useComponentDefaultProps } from '@mantine/core';

import { renderShorthandContent } from '@proedis/react';

import type { ButtonGroupProps } from './ButtonGroup.types';


/* --------
 * Component Definition
 * -------- */
const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>((props, ref) => {

  // ----
  // Props Deconstruct
  // ----
  const {
    children,
    content,

    ...restFlexProps
  } = useComponentDefaultProps('ButtonGroup', {}, props);


  // ----
  // Component Render
  // ----
  return (
    <Flex ref={ref} direction={'row'} gap={'md'} wrap={'nowrap'} align={'center'} {...restFlexProps}>
      {renderShorthandContent({ children, content })}
    </Flex>
  );

});

ButtonGroup.displayName = 'ButtonGroup';

export default ButtonGroup;
