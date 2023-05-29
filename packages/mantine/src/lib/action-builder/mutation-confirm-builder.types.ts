import type * as React from 'react';

import type {
  BaseActionBuilderConfig,

  BaseActionCancelHandler,
  BaseActionCompletedHandler,
  BaseActionErrorHandler,
  BaseActionSubmitHandler,

  BaseActionHelpers,
  BaseActionBuilderActions,

  BaseActionBuilderNotifications,
  BaseActionBuilderProps
} from './action-builder.types';


/* --------
 * Glossary
 * --
 * To strip out all the name of the generic type, they have been reduced to one letter only:
 *  - P  ->  TProps  : is the Props interface defined by the user when building a new MutationForm
 *  - R  ->  TResult : is the Result type of the mutation once completed
 * -------- */


/* --------
 * Utility Types
 * -------- */
type PlainOrBuilder<TOut, P extends {}, R> = TOut | ((props: MutationConfirmProps<P, R>) => TOut);

export interface ConfirmActionHelpers extends BaseActionHelpers {
}


/* --------
 * Action Types
 * -------- */
export type MutationConfirmCancelHandler<P extends {}> =
  BaseActionCancelHandler<ConfirmActionHelpers, MutationConfirmProps<P, any>>;

export type MutationConfirmCompleteHandler<P extends {}, R> =
  BaseActionCompletedHandler<R, void, ConfirmActionHelpers, MutationConfirmProps<P, R>>;

export type MutationConfirmSubmitHandler<P extends {}, R> =
  BaseActionSubmitHandler<R, void, ConfirmActionHelpers, MutationConfirmProps<P, R>>;

export type MutationConfirmErrorHandler<P extends {}> =
  BaseActionErrorHandler<void, ConfirmActionHelpers, MutationConfirmProps<P, any>>;

// eslint-disable-next-line max-len
export type MutationConfirmActions<P extends {}, R> = BaseActionBuilderActions<MutationConfirmCancelHandler<P>, MutationConfirmCompleteHandler<P, R>, MutationConfirmSubmitHandler<P, R>, MutationConfirmErrorHandler<P>>;


/* --------
 * Notification
 * -------- */
export interface MutationConfirmNotifications extends BaseActionBuilderNotifications {
}


/* --------
 * Component Props
 * -------- */

/**
 * Those are the complete props exposed by the MutationConfirm builder
 * accepted by the final component:
 *  - the user defined props
 *  - the set of actions
 *  - the Base Action Builder props
 */
export type MutationConfirmProps<P extends {}, R> = BaseActionBuilderProps<P, MutationConfirmActions<P, R>>;

/**
 * The exposed MutationConfirm built Component element.
 * It will be a React FunctionElement that will accept all the external exposed props
 */
export type MutationConfirmComponent<P extends {}, R> = React.FunctionComponent<MutationConfirmProps<P, R>>;

/**
 * The internal Content element props of the Mutation Builder function.
 * Those are the props of the configuration object's Content, that is the Function Element
 * rendered inside the built form component
 */
export type MutationConfirmContentProps<P extends {}, R> =
  & MutationConfirmProps<P, R>
  & { isSubmitting: boolean };


/* --------
 * Configuration Types
 * -------- */
export interface MutationConfirmBuilderConfig<P extends {}, R>
  extends BaseActionBuilderConfig<MutationConfirmContentProps<P, R>, MutationConfirmActions<P, R>, MutationConfirmNotifications> {
  /** The default props to use */
  defaultProps?: PlainOrBuilder<Partial<MutationConfirmProps<P, R>>, P, R>;

  /** Override props */
  overrideProps?: PlainOrBuilder<Partial<MutationConfirmProps<P, R>>, P, R>;
}
