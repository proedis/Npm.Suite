import * as React from 'react';

import { useAutoControlledState } from '@proedis/react';
import { useClientQueryHooks } from '@proedis/react-client';

import type { RequestError } from '@proedis/client';

import notify from '../../notify';

import type { ModalProps } from '../../../components/Modal';

import type {
  BaseActionHelpers,
  BaseActionBuilderActions,
  BaseActionBuilderConfig,
  BaseActionBuilderProps
} from '../action-builder.types';


/* --------
 * Internal Types
 * -------- */
interface BaseUseActionBuilderResult {
  /** Actions helpers, to be passed to Action Handlers */
  actionHelpers: BaseActionHelpers;

  /** Handle the modal close state, changing internal open state */
  handleModalClose: Exclude<ModalProps['onModalClose'], undefined>;

  /** Handle the modal open state, changing internal open state */
  handleModalOpen: Exclude<ModalProps['onModalOpen'], undefined>;

  /** The current modal component state */
  isModalOpen: boolean;
}

export type UseActionBuilderResult<TActions extends BaseActionBuilderActions> =
  & BaseUseActionBuilderResult
  & TActions;


/* --------
 * Hook Definition
 * -------- */
export default function useActionBuilder<
  TActions extends BaseActionBuilderActions,
  TProps extends BaseActionBuilderProps<{}, TActions>
>(
  configuration: BaseActionBuilderConfig<any, any, any>,
  userDefinedProps: TProps
): UseActionBuilderResult<TActions> {

  // ----
  // Deconstruct from Configuration
  // ----
  const {
    // Actions
    onCancel     : defaultDefinedCancelHandler,
    onCompleted  : defaultDefinedCompletedHandler,
    onSubmit     : defaultDefinedSubmitHandler,
    onSubmitError: defaultDefinedSubmitErrorHandler

    // Mutation Options
  } = configuration;


  // ----
  // Deconstruct from User Defined Props
  // ----
  const {
    // Actions
    onCancel     : userDefinedCancelHandler,
    onCompleted  : userDefinedCompletedHandler,
    onSubmit     : userDefinedSubmitHandler,
    onSubmitError: userDefinedSubmitErrorHandler,

    // Modal Props
    isModal,
    defaultOpen : userDefinedModalDefaultOpen,
    onModalClose: userDefinedModalCloseHandler,
    onModalOpen : userDefinedModalOpenHandler,
    open        : userDefinedModalOpen
  } = userDefinedProps;


  // ----
  // Define Actions
  // ----
  const onCancel = userDefinedCancelHandler || defaultDefinedCancelHandler;
  const onCompleted = userDefinedCompletedHandler || defaultDefinedCompletedHandler;
  const onSubmit = userDefinedSubmitHandler || defaultDefinedSubmitHandler;
  const onSubmitError = userDefinedSubmitErrorHandler || defaultDefinedSubmitErrorHandler;


  // ----
  // Internal State
  // ----
  const [ currentActionError, setCurrentActionError ] = React.useState<RequestError>();
  const [ isModalOpen, trySetIsModalOpen ] = useAutoControlledState<boolean>(false, {
    defaultValue: userDefinedModalDefaultOpen,
    value       : userDefinedModalOpen
  });


  // ----
  // Internal Hooks
  // ----
  const { useClient } = useClientQueryHooks();
  const client = useClient();


  // ----
  // Memoized Elements
  // ----
  const actionHelpers = React.useMemo<BaseActionHelpers>(
    () => ({
      client,
      error   : currentActionError,
      setError: setCurrentActionError,
      notify
    }),
    [ client, currentActionError ]
  );


  // ----
  // Handlers
  // ----
  const handleModalOpen = React.useCallback<Exclude<ModalProps['onModalOpen'], undefined>>(
    () => {
      /** If content has not been rendered as Modal, return */
      if (!isModal) {
        return;
      }

      /** Try to set the auto-controlled open state */
      trySetIsModalOpen(true);

      /** Check and call (if defined) the user handler */
      if (typeof userDefinedModalOpenHandler === 'function') {
        userDefinedModalOpenHandler();
      }
    },
    [ userDefinedModalOpenHandler, trySetIsModalOpen, isModal ]
  );

  const handleModalClose = React.useCallback<Exclude<ModalProps['onModalClose'], undefined>>(
    () => {
      /** If content has not been rendered as Modal, return */
      if (!isModal) {
        return;
      }

      /** Try to set the auto-controlled open state */
      trySetIsModalOpen(false);

      /** Check and call (if defined) the user handler */
      if (typeof userDefinedModalCloseHandler === 'function') {
        userDefinedModalCloseHandler();
      }
    },
    [ userDefinedModalCloseHandler, trySetIsModalOpen, isModal ]
  );


  // ----
  // Return Data
  // ----
  return {
    // Action Helpers
    actionHelpers,

    // Internal State
    isModalOpen,

    // Handlers
    handleModalClose,
    handleModalOpen,

    // Actions
    ...({
      onCancel,
      onCompleted,
      onSubmit,
      onSubmitError
    } as TActions)
  };

}
