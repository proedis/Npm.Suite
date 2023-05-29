import * as React from 'react';

import { Tooltip } from '@mantine/core';

import type { WithTooltipProps } from './WithTooltip.types';


/* --------
 * Component Definition
 * -------- */
const WithTooltip: React.FunctionComponent<WithTooltipProps> = (props) => {

  // ----
  // Props Deconstruct
  // ----
  const {
    content,
    label,
    tooltipProps
  } = props;


  // ----
  // Without required prop, render nothing
  // ----
  if (!content) {
    return null;
  }


  // ----
  // Without tooltip label, return content only
  // ----
  if (!label) {
    return (
      <React.Fragment>
        {content}
      </React.Fragment>
    );
  }


  // ----
  // Component Render
  // ----
  return (
    <Tooltip label={label} {...tooltipProps}>
      {content}
    </Tooltip>
  );

};

WithTooltip.displayName = 'WithTooltip';

export default WithTooltip;
