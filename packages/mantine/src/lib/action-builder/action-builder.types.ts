import type * as React from 'react';

import type { QueryKey, MutationKey } from '@tanstack/react-query';

import type { ShorthandItem } from '@proedis/react';
import type { Client, RequestError } from '@proedis/client';

import type Notify from '../notify';
import type { NotificationContent } from '../notify';

import type { ButtonProps } from '../../components/Button';
import type { HeaderProps } from '../../components/Header';
import type { ModalProps } from '../../components/Modal';


/* --------
 * Glossary
 * --
 * To strip out all the name of the generic type, they have been reduced to one letter only:
 *  - D  ->  TDto    : is the Dto interface of the object that will be sent to mutation
 *  - P  ->  TProps  : is the Props interface defined by the user when building a new MutationForm
 *  - R  ->  TResult : is the Result type of the mutation once completed
 * -------- */


/* --------
 * Utility Types
 * -------- */
export type MaybePromise<TOut> = TOut | Promise<TOut>;

export type PlainOrBuilder<TOut, P extends {}> = ((props: P) => TOut) | TOut;


/* --------
 * Action Types
 * -------- */
export interface BaseActionHelpers {
  /** Current client instance */
  client: Client<any, any, any>;

  /** Action error received by client request */
  error: RequestError | undefined;

  /** The notification system */
  notify: typeof Notify;

  /** A dispatch action that could be used to change the error */
  setError: React.Dispatch<React.SetStateAction<RequestError | undefined>>;
}

/** A generic type for the action that will be fired when the cancel button has been pressed */
export type BaseActionCancelHandler<H extends BaseActionHelpers, P extends {}> =
  (helpers: H, props: P) => MaybePromise<void>;

/** A generic type for the action that will be fired after the submitting has been completed with success */
export type BaseActionCompletedHandler<R, D, H extends BaseActionHelpers, P extends {}> =
  D extends void
    ? ((result: R, helpers: H, props: P) => MaybePromise<void>)
    : ((result: R, data: D, helpers: H, props: P) => MaybePromise<void>);

/** A generic type for the action that will be fired when the submit button has been pressed */
export type BaseActionSubmitHandler<R, D, H extends BaseActionHelpers, P extends {}> =
  D extends void
    ? ((helpers: H, props: P) => MaybePromise<R>)
    : ((data: D, helpers: H, props: P) => MaybePromise<R>);

/** A generic type for the action that will be fired after the submitting has been completed with error */
export type BaseActionErrorHandler<D, H extends BaseActionHelpers, P extends {}> =
  D extends void
    ? ((error: any, helpers: H, props: P) => MaybePromise<void>)
    : ((error: any, data: D, helpers: H, props: P) => MaybePromise<void>);

export interface BaseActionBuilderActions<OnCancel = any, OnCompleted = any, OnSubmit = any, OnSubmitError = any> {
  /** Handler to Execute on Cancel Button Click */
  onCancel?: OnCancel;

  /** Handler to Execute on Action Completed */
  onCompleted?: OnCompleted;

  /** Handler to Execute on Submit Button Click */
  onSubmit: OnSubmit;

  /** Handler to Execute on Submit Handler Error */
  onSubmitError?: OnSubmitError;
}


/* --------
 * Notifications
 * -------- */
export interface BaseActionBuilderNotifications {
  /** On Canceled Message */
  onCanceled?: NotificationContent;

  /** On Error Message */
  onError?: false | 'thrown' | ((error: any) => NotificationContent) | NotificationContent;

  /** On Success Message */
  onSubmitted?: NotificationContent;
}


/* --------
 * Configuration Types
 * -------- */
interface BaseActionBuilderStrictConfig<P extends {}, TNotifications> {
  /** Plain object or builder to render the Cancel Button */
  cancelButton?: PlainOrBuilder<ShorthandItem<ButtonProps>, P>;

  /** The main content to show */
  Content?: React.FunctionComponent<P>;

  /** The component display name */
  displayName: string;

  /** An array of queries to be invalidated on mutation success */
  invalidateQueries?: PlainOrBuilder<QueryKey[], P>;

  /** Optional set of Mutation Key */
  mutationKey?: MutationKey;

  /** Default toast message to show on action */
  notify?: TNotifications;

  /** Plain object or builder to render the Submit Button */
  submitButton?: PlainOrBuilder<ShorthandItem<ButtonProps>, P>;

  /** The trigger to use while render the action as modal */
  trigger?: PlainOrBuilder<ModalProps['trigger'], P>;
}

export type BaseActionBuilderConfig<
  P extends {},
  TActions extends BaseActionBuilderActions,
  TNotification
> =
  & TActions
  & BaseActionBuilderStrictConfig<P, TNotification>;


/* --------
 * Returned Component Props
 * -------- */
interface BaseActionBuilderStrictProps {
  /** The cancel button to show */
  cancelButton?: ShorthandItem<ButtonProps>;

  /** Set the default open modal state */
  defaultOpen?: ModalProps['defaultOpen'];

  /** Define the Action Header, rendered on top of action if static or as Modal Header in modal style */
  header?: ShorthandItem<HeaderProps>;

  /** Choose if the Action must be rendered inside a modal component */
  isModal?: boolean;

  /** Define props to use while rendering action inside a modal */
  modalProps?: Omit<ModalProps, 'header' | 'trigger' | 'onModalClose' | 'onModalOpen'>;

  /** Handle the modal close event */
  onModalClose?: ModalProps['onModalClose'];

  /** Handle the modal open event */
  onModalOpen?: ModalProps['onModalOpen'];

  /** Manually control open modal state */
  open?: ModalProps['open'];

  /** The submit button to show */
  submitButton?: ShorthandItem<ButtonProps>;

  /** The trigger to use while render the action as modal */
  trigger?: ModalProps['trigger'];
}


/* --------
 * Returned Component Complete Props
 * -------- */
export type BaseActionBuilderProps<P extends {}, TActions extends BaseActionBuilderActions> =
  & P
  & Partial<TActions>
  & BaseActionBuilderStrictProps;
