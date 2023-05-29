import * as React from 'react';

import { Box } from '@mantine/core';

import { useMutation } from '@tanstack/react-query';

import { useSafeState } from '@proedis/react';
import type { RequestError } from '@proedis/client';

import type {
  MutationConfirmBuilderConfig,
  MutationConfirmComponent,
  MutationConfirmProps,
  MutationConfirmActions,
  MutationConfirmContentProps
} from './mutation-confirm-builder.types';

import useActionBuilder from './utils/useActionBuilder';
import useActionButtons from './utils/useActionButtons';
import useActionNotifications from './utils/useActionNotification';
import useQueryInvalidation from './utils/useQueryInvalidation';

import Header from '../../components/Header';
import Modal from '../../components/Modal';


/* --------
 * Mutation Confirm Builder
 * -------- */
export default function createMutationConfirm<P extends {}, R = void>(
  configuration: MutationConfirmBuilderConfig<P, R>
): MutationConfirmComponent<P, R> {

  // ----
  // Deconstruct Configuration Object
  // ----
  const {

    // Content Element
    Content    : ConfirmContent,
    displayName: defaultDisplayName,

    // Buttons & Trigger Definition
    cancelButton: defaultDefinedCancelButtonBuilder,
    submitButton: defaultDefinedSubmitButtonBuilder,
    trigger     : defaultDefinedTriggerBuilder,

    // Notifications
    notify: defaultDefinedNotifySettings,

    // Props Builder
    defaultProps : defaultPropsBuilder,
    overrideProps: overridePropsBuilder,

    // Mutation Configuration
    invalidateQueries,
    mutationKey

  } = configuration;


  // ----
  // Define the Confirm Component
  // ----
  const MutationConfirm: MutationConfirmComponent<P, R> = (userDefinedProps) => {

    // ----
    // Build default/override props and merge together
    // ----
    const defaultProps = typeof defaultPropsBuilder === 'function'
      ? defaultPropsBuilder(userDefinedProps)
      : defaultPropsBuilder;

    const overrideProps = typeof overridePropsBuilder === 'function'
      ? overridePropsBuilder({ ...defaultProps, ...userDefinedProps })
      : overridePropsBuilder;

    const props: MutationConfirmProps<P, R> = {
      ...defaultProps,
      ...userDefinedProps,
      ...overrideProps,
      modalProps: {
        ...defaultProps?.modalProps,
        ...userDefinedProps.modalProps,
        ...overrideProps?.modalProps
      }
    };


    // ----
    // Props Deconstruct
    // ----
    const {
      // Shared elements
      header,

      // Buttons & Trigger
      cancelButton: userDefinedCancelButton,
      submitButton: userDefinedSubmitButton,
      trigger     : userDefinedTrigger,

      // Modal Props
      isModal   : renderAsModalContent,
      modalProps: userDefinedModalProps
    } = props;


    // ----
    // Compose Configuration and Props to get Action Helpers, State and Handlers
    // ----
    const {
      actionHelpers,
      isModalOpen,
      handleModalClose,
      handleModalOpen,
      onCancel,
      onCompleted,
      onSubmit,
      onSubmitError
    } = useActionBuilder<MutationConfirmActions<P, R>, MutationConfirmProps<P, R>>(configuration, props);

    const notifications = useActionNotifications({
      ...defaultDefinedNotifySettings,
      onError: defaultDefinedNotifySettings?.onError ?? 'thrown'
    });


    // ----
    // Internal State
    // ----
    const [ isPerformingAction, setIsPerformingAction ] = useSafeState<boolean>(false);


    // ----
    // Reset Assertion on Modal Closed
    // ----
    React.useEffect(
      () => {
        /** Assert the isSubmitting boolean is falsy on modal open */
        if (renderAsModalContent && isModalOpen) {
          setIsPerformingAction(false);
        }
      },
      [ renderAsModalContent, isModalOpen, setIsPerformingAction ]
    );


    // ----
    // Merge props and utilities to build confirm content props
    // ----
    const confirmContentProps: MutationConfirmContentProps<P, R> = { ...props, isSubmitting: isPerformingAction };


    // ----
    // Mutation Logic
    // ----
    const queriesInvalidator = useQueryInvalidation(confirmContentProps, invalidateQueries);
    const mutate = useMutation<R, RequestError, void, P>({
      mutationKey,
      onMutate  : () => props,
      onSuccess : queriesInvalidator,
      mutationFn: async () => onSubmit(actionHelpers, props)
    });


    // ----
    // Handlers
    // ----
    const handleSubmitClick = async () => {
      /** Set submitting state */
      setIsPerformingAction(true);

      try {
        /** Use the mutation hook to create the result */
        const result = await mutate.mutateAsync();

        /** Check if an onComplete function exists and fire it */
        if (typeof onCompleted === 'function') {
          await onCompleted(result as R, actionHelpers, props);
        }

        /** Raise the Submitted Notification */
        notifications.raiseSubmitted();

        /** If the component has been rendered as modal, close it */
        handleModalClose();
      }
      catch (error: any) {
        /** Raise the notification error */
        notifications.raiseError(error);

        /** Check if a catch error function has been defined */
        if (typeof onSubmitError === 'function') {
          try {
            await onSubmitError(error, actionHelpers, props);
          }
          catch (catchFunctionError) {
            global.console.warn('[ MutationConfirm ] : an error occurred on onSubmitError handler', catchFunctionError);
          }
        }
      }
      finally {
        /** Remove the submitting state */
        setIsPerformingAction(false);
      }
    };

    const handleCancelClick = async () => {
      /** Set performing action state */
      setIsPerformingAction(true);

      try {
        /** Call the user defined onCancel handler */
        if (typeof onCancel === 'function') {
          await onCancel(actionHelpers, props);
        }

        /** Raise the Canceled Notification */
        notifications.raiseCanceled();

        /** If the component has been rendered as modal, close it */
        handleModalClose();
      }
      catch (error) {
        global.console.warn('[ MutationForm ] : an error occurred on onSubmitError handler', error);
      }
      finally {
        /** Remove the performing action state */
        setIsPerformingAction(false);
      }
    };


    // ----
    // Build default defined Buttons & Trigger
    // ----
    const mutationConfirmActions = useActionButtons(
      {
        key                  : 0,
        builderProps         : confirmContentProps,
        defaultDefinedBuilder: defaultDefinedCancelButtonBuilder,
        onClick              : handleCancelClick,
        overrideProps        : {
          disabled: isPerformingAction
        },
        userDefined          : userDefinedCancelButton
      }, {
        key                  : 1,
        builderProps         : confirmContentProps,
        defaultDefinedBuilder: defaultDefinedSubmitButtonBuilder,
        onClick              : handleSubmitClick,
        defaultProps         : {
          color: 'primary'
        },
        overrideProps        : {
          disabled: isPerformingAction,
          type    : 'submit'
        },
        userDefined          : userDefinedSubmitButton
      }
    );

    const trigger = userDefinedTrigger ?? (
      typeof defaultDefinedTriggerBuilder === 'function'
        ? defaultDefinedTriggerBuilder(confirmContentProps)
        : defaultDefinedTriggerBuilder
    );


    // ----
    // Component Building
    // ----
    const confirmElement = (
      <div>
        {ConfirmContent && (
          <ConfirmContent {...confirmContentProps} />
        )}
        {mutationConfirmActions && (
          <Box mt={ConfirmContent ? 'lg' : undefined}>
            {mutationConfirmActions}
          </Box>
        )}
      </div>
    );


    // ----
    // Component render
    // ----

    /** Render as Plain Element */
    if (!renderAsModalContent) {
      return (
        <div>
          {Header.create(header, { autoGenerateKey: false })}
          {confirmElement}
        </div>
      );
    }

    /** Render as Modal Content */
    return (
      <Modal
        {...userDefinedModalProps}
        open={isModalOpen}
        onModalClose={handleModalClose}
        onModalOpen={handleModalOpen}
        header={header}
        trigger={trigger}
      >
        {confirmElement}
      </Modal>
    );

  };

  MutationConfirm.displayName = defaultDisplayName;

  return MutationConfirm;

}
