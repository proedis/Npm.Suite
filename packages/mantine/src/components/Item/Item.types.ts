import type { ShorthandItem, ShorthandCollection } from '@proedis/react';
import type { ShorthandContent, UIVoidComponentProps } from '@proedis/react';

import type { AvatarProps } from '../Avatar';
import type { IconButtonProps } from '../IconButton';


export type ItemProps = UIVoidComponentProps<StrictItemProps>;

export interface StrictItemProps {

  /** Set Item Actions */
  actions?: ShorthandCollection<IconButtonProps>;

  /** Set the item as active */
  active?: boolean;

  /** Define the Avatar */
  avatar?: ShorthandItem<AvatarProps>;

  /** Define the Item Content Text */
  content?: ShorthandContent;

  /** Set the item as Draggable */
  draggable?: boolean;

  /** Set the draggable item id */
  draggableId?: string;

  /** Set the draggable item index */
  draggableIndex?: number;

  /** On click handler */
  onClick?: () => void;

  /** Define the Item Title Text */
  title?: ShorthandContent;

  /** Define truncate text */
  truncate?: boolean;

  /** Define the Item SubTitle Text */
  subtitle?: ShorthandContent;

  /** Tell the item to use DragHandle instead full dragging element */
  useDragHandle?: boolean;

}
