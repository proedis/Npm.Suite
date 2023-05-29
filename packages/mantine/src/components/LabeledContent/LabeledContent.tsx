import * as React from 'react';

import { Box, Text, createPolymorphicComponent, useMantineTheme } from '@mantine/core';

import { renderShorthandContent } from '@proedis/react';

import type { LabeledContentProps } from './LabeledContent.types';


/* --------
 * Component Definition
 * -------- */
const _LabeledContent = React.forwardRef<HTMLDivElement, LabeledContentProps>((props, ref) => {

  // ----
  // Props Deconstruct
  // ----
  const {
    children,
    content,

    color,

    label,
    meta,

    ...rest
  } = props;


  // ----
  // Internal Hooks
  // ----
  const theme = useMantineTheme();


  // ----
  // Component Render
  // ----
  return (
    <Box component={'div'} ref={ref} {...rest}>
      {label && (
        <Text fz={'xs'} c={color} fw={theme.other.fontWeight.medium} opacity={.5}>
          {label}
        </Text>
      )}
      <Text fz={'sm'} c={color} fw={theme.other.fontWeight.medium}>
        {renderShorthandContent({ children, content })}
      </Text>
      {meta && (
        <Text fz={'xs'} c={color} opacity={.75}>
          {meta}
        </Text>
      )}
    </Box>
  );

});

const LabeledContent = createPolymorphicComponent<'div', LabeledContentProps>(_LabeledContent);

export default LabeledContent;
