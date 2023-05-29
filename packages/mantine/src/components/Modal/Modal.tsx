import React from 'react';

import { useAutoControlledState } from '@proedis/react';

import { Modal as BaseModal } from '@mantine/core';

import Button from '../Button';
import Header from '../Header';
import IconButton from '../IconButton';

import { ModalContextProvider } from './Modal.context';

import type { ModalContextValue } from './Modal.context';
import type { ModalProps } from './Modal.types';


const Modal: React.FunctionComponent<ModalProps> = (props) => {

  // ----
  // Props Deconstruction
  // ----
  const {
    // Modal content and style
    children,
    className,
    content,

    // AutoControlled Open State
    defaultOpen: userDefinedDefaultOpen,
    open       : userDefined,

    // Handlers
    onModalOpen,
    onModalClose,
    onModalClosed,

    // Triggers
    trigger,

    // Modal Elements
    header,

    // Specific Modal Props
    radius,
    size
  } = props;


  // ----
  // Internal State
  // ----
  const [ open, trySetOpen ] = useAutoControlledState(
    false,
    {
      defaultValue: userDefinedDefaultOpen,
      value       : userDefined
    }
  );


  // ----
  // Handlers
  // ----
  const handleOpenModal = React.useCallback(
    () => {
      trySetOpen(true);

      if (typeof onModalOpen === 'function') {
        onModalOpen();
      }

    }, [ trySetOpen, onModalOpen ]);


  const handleCloseModal = React.useCallback(
    () => {
      trySetOpen(false);

      if (typeof onModalClose === 'function') {
        onModalClose();
      }
    },
    [ trySetOpen, onModalClose ]
  );


  // ----
  // Trigger Builders
  // ----
  const triggerOnClickOverride = React.useCallback(
    (original?: React.MouseEventHandler<HTMLButtonElement>): React.MouseEventHandler<HTMLButtonElement> => (event) => {
      /** Open the Modal */
      handleOpenModal();

      /** Check if a user defined onClick function must be invoked */
      if (typeof original === 'function') {
        original(event);
      }
    },
    [ handleOpenModal ]
  );

  const triggerElement = React.useMemo(
    () => {
      /** Avoid if no trigger */
      if (!trigger) {
        return null;
      }

      /** Render as icon if defined */
      if ('icon' in trigger) {
        return IconButton.create(trigger.icon, {
          autoGenerateKey: false,
          overrideProps  : (originalIconButtonProps) => ({
            tooltip: originalIconButtonProps.tooltip,
            onClick: triggerOnClickOverride(originalIconButtonProps.onClick)
          })
        });
      }

      /** Render as button if defined */
      if ('button' in trigger) {
        return Button.create(trigger.button, {
          autoGenerateKey: false,
          overrideProps  : (originalButtonProps) => ({
            tooltip: originalButtonProps.tooltip,
            onClick: triggerOnClickOverride(originalButtonProps.onClick)
          })
        });
      }

      /** Fallback to null */
      return null;
    },
    [ trigger, triggerOnClickOverride ]
  );


  // ----
  // Memoized Elements
  // ----
  const headerElement = React.useMemo(
    () => Header.create(header, {
      autoGenerateKey: false,
      overrideProps  : (userDefinedHeaderProps) => ({
        centered: true,
        fit     : true,
        actions : [
          // Keep user defined actions
          ...(userDefinedHeaderProps?.actions ?? []),
          // Add the IconButton to close the Modal
          IconButton.create({
            key    : '__modal_close',
            icon   : {
              icon: 'times',
              fz  : 'xl'
            },
            onClick: handleCloseModal,
            size   : 'lg',
            variant: 'subtle',
            color  : 'cloud.5'
          }, { autoGenerateKey: true })
        ]
      })
    }),
    [ header, handleCloseModal ]
  );


  // ----
  // Context Value
  // ----
  const ctx = React.useMemo<ModalContextValue>(
    () => ({
      closeModal: handleCloseModal
    }), [ handleCloseModal ]);


  // ----
  // Component Render
  // ----
  return (
    <React.Fragment>

      {triggerElement}

      <BaseModal.Root
        opened={open}
        padding={'xl'}
        size={size}
        onClose={handleCloseModal}
        transitionProps={{
          onExited: onModalClosed
        }}
      >
        <BaseModal.Overlay />
        <BaseModal.Content radius={radius} className={className}>
          <BaseModal.Header>
            {headerElement}
          </BaseModal.Header>
          <BaseModal.Body>
            <ModalContextProvider value={ctx}>
              {content || children}
            </ModalContextProvider>
          </BaseModal.Body>
        </BaseModal.Content>
      </BaseModal.Root>

    </React.Fragment>
  );
};

Modal.defaultProps = {
  radius: 'lg'
};

Modal.displayName = 'Modal';


export default Modal;
