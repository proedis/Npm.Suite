import type { MantineColor } from '@mantine/core';

import type { ShorthandContent, UIComponentProps } from '@proedis/react';


export type LabeledContentProps = UIComponentProps<StrictLabeledContentProps>;

export interface StrictLabeledContentProps {
  /** Set the color of the entire labeled content */
  color?: MantineColor;

  /** The label to show */
  label?: ShorthandContent;

  /** Meta content, placed under main text */
  meta?: ShorthandContent;
}
