import type { ShorthandCollection } from '@proedis/react';

import type { MantineSize } from '@mantine/core';

import type { ShorthandContent, UIVoidComponentProps } from '@proedis/react';

import type { IconButtonProps } from '../IconButton';
import type { ShorthandIcon } from '../Icon';


export type HeaderProps = UIVoidComponentProps<StrictHeaderProps>;

export interface StrictHeaderProps {
  /** Set an array of actions to display within the Header */
  actions?: ShorthandCollection<IconButtonProps>;

  /** Center the Actions and the Header Content vertically */
  centered?: boolean;

  /** Fit the Header, removing the default bottom margin */
  fit?: boolean;

  /** Add an icon to the header */
  icon?: ShorthandIcon;

  /** Render a smaller header */
  size?: MantineSize;

  /** Subheader content */
  subtitle?: ShorthandContent;

  /** Content to show has main text */
  title?: ShorthandContent;
}
