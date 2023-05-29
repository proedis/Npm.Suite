import type * as React from 'react';

import type { TooltipProps } from '@mantine/core';


export interface WithTooltipProps {
  /**
   * Content to render, fundamentally the Tooltip trigger.
   * Without the content, no tooltip element will be rendered
   */
  content?: React.ReactNode;

  /**
   * The Tooltip label to show while hovering the content.
   * Without label, no tooltip element will be rendered
   */
  label?: React.ReactNode;

  /** Extra props for Tooltip element */
  tooltipProps?: Omit<TooltipProps, 'children' | 'label'>;
}
