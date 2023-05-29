import type { ShorthandItem, UIComponentProps } from '@proedis/react';

import type { MantineNumberSize } from '@mantine/core';

import type { ButtonProps } from '../Button';
import type { HeaderProps } from '../Header';
import type { IconButtonProps } from '../IconButton';


export type ModalProps = UIComponentProps<StrictModalProps>;

export interface StrictModalProps {
  /** Set the default open state of the modal */
  defaultOpen?: boolean;

  /** Handle the Modal Close event */
  onModalClose?: () => void;

  /** Handler called when Modal is completely closed and hidden */
  onModalClosed?: () => void;

  /** Handle the Modal Open event */
  onModalOpen?: () => void;

  /** Manually control the open state of the Modal */
  open?: boolean;

  /** Set the modal border radius */
  radius?: MantineNumberSize,

  /** Set the size of the modal */
  size?: MantineNumberSize;

  /** Set the Modal Header */
  header?: ShorthandItem<HeaderProps>;

  /** Set the Modal trigger, choosing between button or icon button */
  trigger?:
    | { button: ShorthandItem<ButtonProps> }
    | { icon: ShorthandItem<IconButtonProps> }

  /** Define a tooltip for the trigger element */
  tooltip?: string;
}
