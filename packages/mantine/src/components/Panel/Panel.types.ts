import type { ShorthandCollection, ShorthandItem, UIComponentProps } from '@proedis/react';

import type { HeaderProps } from '../Header';
import type { IconButtonProps } from '../IconButton';


export type PanelProps = UIComponentProps<StrictPanelProps>;

export interface StrictPanelProps {
  /** Set the panel as collapsable, adding the functionality to open/close body */
  collapsable?: boolean;

  /** Set the default open state for a collapsable panel */
  defaultOpen?: boolean;

  /** Add a collection of Floating Action Button to Panel Body */
  fabs?: ShorthandCollection<IconButtonProps>;

  /** Set the content of the Panel Header */
  header?: ShorthandItem<HeaderProps>;
}
