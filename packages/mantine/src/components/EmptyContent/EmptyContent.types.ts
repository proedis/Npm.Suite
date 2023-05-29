import type { ShorthandCollection } from '@proedis/react';

import type { MantineColor, DefaultProps } from '@mantine/core';

import type { ShorthandContent } from '@proedis/react';

import type { ButtonProps } from '../Button';
import type { ShorthandIcon } from '../Icon';


/* --------
 * EmptyContent Definitive Props Definition
 * -------- */
export interface EmptyContentProps extends StrictEmptyContentProps, DefaultProps<never, {}> {

}


export interface StrictEmptyContentProps {
  /** Add a set of action button to EmptyContent */
  actions?: ShorthandCollection<ButtonProps>;

  /** Color to use */
  color?: MantineColor;

  /** Set the content to show on EmptyContent component */
  content?: ShorthandContent;

  /** Set the header to show on EmptyContent component */
  header?: ShorthandContent;

  /** Prepend an icon */
  icon?: ShorthandIcon;
}
