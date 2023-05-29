import type * as React from 'react';

import type { UseFormReturnType } from '@mantine/form';

import type { z } from 'zod';
import type { ZodRawShape } from 'zod';

import type { NotificationContent } from '../notify';

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
 *  - D  ->  TDto    : is the Dto interface of the object that will be sent to mutation
 *  - P  ->  TProps  : is the Props interface defined by the user when building a new MutationForm
 *  - R  ->  TResult : is the Result type of the mutation once completed
 * -------- */

/* --------
 * Utility Types
 * -------- */
type PlainOrBuilder<TOut, D extends {}, P extends {}, R> =
  | ((props: InternalMutationFormProps<D, P, R>) => TOut)
  | TOut;

export interface MutationFormHelpers<D extends {}> extends BaseActionHelpers {
  /** The current FormContext object */
  form: UseFormReturnType<D>;

  /** Boolean checker to get if the mutation form is in editing mode */
  isEditing: boolean;

  /** Boolean checker to get if the mutation is in progress */
  isSubmitting: boolean;
}


/* --------
 * Actions
 * -------- */
export type MutationFormCancelHandler<D extends {}, P extends {}> =
  BaseActionCancelHandler<MutationFormHelpers<D>, InternalMutationFormProps<D, P, any>>;

export type MutationFormCompletedHandler<D extends {}, P extends {}, R> =
  BaseActionCompletedHandler<R, D, MutationFormHelpers<D>, InternalMutationFormProps<D, P, any>>;

export type MutationFormSubmitHandler<D extends {}, P extends {}, R> =
  BaseActionSubmitHandler<R, D, MutationFormHelpers<D>, InternalMutationFormProps<D, P, any>>;

export type MutationFormErrorHandler<D extends {}, P extends {}> =
  BaseActionErrorHandler<D, MutationFormHelpers<D>, InternalMutationFormProps<D, P, any>>;

// eslint-disable-next-line max-len
export type MutationFormActions<D extends {}, P extends {}, R> = BaseActionBuilderActions<MutationFormCancelHandler<D, P>, MutationFormCompletedHandler<D, P, R>, MutationFormSubmitHandler<D, P, R>, MutationFormErrorHandler<D, P>>;


/* --------
 * Notification
 * -------- */
export interface MutationFormNotifications extends Pick<BaseActionBuilderNotifications, 'onCanceled' | 'onError'> {
  /** Notification to show on Creating data submit click */
  onCreatingSubmitted?: NotificationContent;

  /** Notification to show on Editing data submit click */
  onEditingSubmitted?: NotificationContent;
}


/* --------
 * Component Props
 * -------- */

/**
 * Those are the strict and specific props exposed by the MutationForm builder
 * that the built component will accept while using into source code
 */
interface MutationFormStrictProps {
  /** Allow any value by passed as initialValues */
  initialValues?: any;

  /** Force the form to be rendered in isEditing mode */
  isEditing?: boolean;
}

/**
 * Those are the complete props exposed by the MutationForm builder
 * accepted by the final component:
 *  - the Strict Props
 *  - the user defined props
 *  - the set of actions
 *  - the Base Action Builder props
 */
export type MutationFormProps<D extends {}, P extends {}, R> =
  & MutationFormStrictProps
  & BaseActionBuilderProps<P, MutationFormActions<D, P, R>>;

/**
 * The internal mutation form props are all the props accepted by the final form component
 * exposed by the builder, enriched with the Mutation Form helpers.
 * Those props will be used inside the builder function to be passed to all
 * external handlers and function that need to know some extra details about the form state
 */
export type InternalMutationFormProps<D extends {}, P extends {}, R> =
  & MutationFormProps<D, P, R>
  & { isEditing: boolean };

/**
 * The exposed MutationForm built Component element.
 * It will be a React FunctionElement that will accept all the external exposed props
 */
export type MutationFormComponent<D extends {}, P extends {}, R> =
  React.FunctionComponent<MutationFormProps<D, P, R>>;

/**
 * The internal Content element props of the Mutation Builder function.
 * Those are the props of the configuration object's Content, that is the Function Element
 * rendered inside the built form component
 */
export type MutationFormContentProps<D extends {}, P extends {}, R> =
  & InternalMutationFormProps<D, P, R>
  & { form: UseFormReturnType<D>, isSubmitting: boolean };


/* --------
 * Configuration Types
 * -------- */
export type InferDto<TSchema extends ZodRawShape> = z.infer<ReturnType<typeof z.object<TSchema>>>;

export interface MutationFormBuilderConfig<D extends {}, P extends {}, R>
  extends BaseActionBuilderConfig<MutationFormContentProps<D, P, R>, MutationFormActions<D, P, R>, MutationFormNotifications> {
  /** The default props to use */
  defaultProps?: PlainOrBuilder<Partial<MutationFormProps<D, P, R>>, D, P, R>;

  /** Set form data default values */
  defaultValues: PlainOrBuilder<D, D, P, R>;

  /** Parse initialValues for the form before they are used */
  parseInitialValues?: <TIn = any>(
    data: TIn,
    props: InternalMutationFormProps<D, P, R>
  ) => D;

  /** Override props */
  overrideProps?: PlainOrBuilder<Partial<MutationFormProps<D, P, R>>, D, P, R>;
}

export interface UsingSchemaTools<TSchema extends ZodRawShape> {
  // eslint-disable-next-line max-len
  createMutationForm: <P extends {} = {}, R = void>(configuration: MutationFormBuilderConfig<InferDto<TSchema>, P, R>) => (MutationFormComponent<InferDto<TSchema>, P, R>);
}
