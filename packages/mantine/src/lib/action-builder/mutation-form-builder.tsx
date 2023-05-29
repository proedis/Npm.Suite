import * as React from 'react';

import { useMutation } from '@tanstack/react-query';

import realyFastDeepClone from 'rfdc';

import type { ZodObject, ZodRawShape } from 'zod';
import { z } from 'zod';

import { useForm, zodResolver } from '@mantine/form';

import { useSafeState } from '@proedis/react';
import type { RequestError } from '@proedis/client';

import type {
  InferDto,
  MutationFormActions,
  MutationFormBuilderConfig,
  MutationFormComponent,
  MutationFormContentProps,
  MutationFormHelpers,
  MutationFormProps,
  UsingSchemaTools
} from './mutation-form-builder.types';

import useActionBuilder from './utils/useActionBuilder';
import useActionButtons from './utils/useActionButtons';
import useActionNotifications from './utils/useActionNotification';
import useQueryInvalidation from './utils/useQueryInvalidation';

import Form from '../../components/Form';
import Header from '../../components/Header';
import Modal from '../../components/Modal';


/* --------
 * Internal Type
 * -------- */
type HandleOnSubmit<TDto extends {}> = (values: TDto, event: React.FormEvent<HTMLFormElement>) => void;


/* --------
 * Create the Data Cloner
 * -------- */
const dataCloner = realyFastDeepClone({ circles: false, proto: false });


/* --------
 * Mutation Form Builder
 * -------- */
function createMutationForm<D extends {}, P extends {}, R>(
  schema: ZodObject<D>,
  configuration: MutationFormBuilderConfig<D, P, R>
): MutationFormComponent<D, P, R> {

  // ----
  // Deconstruct Configuration Object
  // ----
  const {

    // Content Element
    Content    : FormContent,
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
    mutationKey,

    // Schema and Form Configuration
    defaultValues: defaultValuesBuilder,
    parseInitialValues

  } = configuration;


  // ----
  // Define the Form Component
  // ----
  const MutationForm: MutationFormComponent<D, P, R> = (userDefinedProps) => {

    // ----
    // Extract useful props from userDefinedProps
    // ----
    const {
      isEditing: forcedUserDefinedEditingMode
    } = userDefinedProps;


    // ----
    // Computed the isEditing props
    // ----
    const couldBeEditing: boolean = React.useMemo(
      () => (
        typeof userDefinedProps.initialValues === 'object'
        && userDefinedProps.initialValues !== null
        && !Array.isArray(userDefinedProps.initialValues)
        && !!Object.keys(userDefinedProps.initialValues).length
      ),
      [ userDefinedProps.initialValues ]
    );

    const isEditing = typeof forcedUserDefinedEditingMode === 'boolean'
      ? forcedUserDefinedEditingMode
      : couldBeEditing;


    // ----
    // Build default/override props and merge together
    // ----
    const defaultProps = typeof defaultPropsBuilder === 'function'
      ? defaultPropsBuilder({ ...userDefinedProps, isEditing })
      : defaultPropsBuilder;

    const overrideProps = typeof overridePropsBuilder === 'function'
      ? overridePropsBuilder({ ...defaultProps, ...userDefinedProps, isEditing })
      : overridePropsBuilder;

    const props: MutationFormProps<D, P, R> = {
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
      modalProps: userDefinedModalProps,

      // Form Props
      initialValues: userDefinedInitialValues
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
    } = useActionBuilder<MutationFormActions<D, P, R>, MutationFormProps<D, P, R>>(configuration, props);

    const notifications = useActionNotifications({
      onCanceled : defaultDefinedNotifySettings?.onCanceled,
      onError    : defaultDefinedNotifySettings?.onError ?? 'thrown',
      onSubmitted: isEditing
        ? defaultDefinedNotifySettings?.onEditingSubmitted
        : defaultDefinedNotifySettings?.onCreatingSubmitted
    });


    // ----
    // Initial Values Building
    // ----
    const initialValues = React.useMemo<D>(
      () => {
        /** Compute the form default values, because they will be merged with the user-defined initial values */
        const defaultValues = typeof defaultValuesBuilder === 'function'
          ? (defaultValuesBuilder as ((props: any) => D))({ ...props, isEditing })
          : defaultValuesBuilder;

        /** While rendering data in editing mode, the default values will be cloned to lose object reference */
        if ((isEditing && couldBeEditing) || couldBeEditing) {
          /** Transform user-defined initial values, checking if a toObject() function exists */
          const transformedInitialValues = !!userDefinedInitialValues && typeof userDefinedInitialValues.toObject === 'function'
            ? userDefinedInitialValues.toObject()
            : (userDefinedInitialValues || {});

          /** Deep clone initial data */
          const clonedInitialValues = {
            ...defaultValues,
            ...dataCloner(transformedInitialValues)
          };

          /** Return initial values, parsing data if function has been defined */
          return (
            typeof parseInitialValues === 'function'
              ? parseInitialValues(clonedInitialValues, { ...props, isEditing })
              : clonedInitialValues
          );
        }

        /** Return defined default values */
        return defaultValues;
      },
      // Heads Up!
      // Props always change, then default values can't change every render:
      // component props are stripped from useMemo dependencies
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [ couldBeEditing, isEditing, userDefinedInitialValues ]
    );


    // ----
    // Internal State
    // ----
    const [ isPerformingAction, setIsPerformingAction ] = useSafeState<boolean>(false);


    // ----
    // Usage of the useForm Mantine Hook
    // ----
    const form = useForm({
      initialValues          : initialValues,
      clearInputErrorOnChange: true,
      validateInputOnChange  : true,
      validate               : zodResolver(schema)
    });


    // ----
    // Utilities
    // ----
    /**
     * The hook useForm won't use new initialValues
     * on form reset, because they aren't included in core useCallback dependencies.
     * To resolve this issue, set new values and manually clear error
     */
    const hardResetForm = React.useCallback(
      (values: D) => {
        form.setValues(values);
        form.clearErrors();
        form.setDirty({});
        form.resetTouched();
      },
      /**
       * Heads Up!
       * The hard reset of the form based on new initial values
       * will depend on a set of utilities exposed by the useForm hook
       * when initialized.
       * All these utilities are useCallback too, without
       * any other dependencies, so there is no need to add them to dependencies
       */
      // eslint-disable-next-line
      []
    );


    // ----
    // Reset Assertion on Modal Closed
    // ----
    React.useEffect(
      () => {
        /** Assert the isSubmitting boolean is falsy on modal open and reset the form */
        if (renderAsModalContent && isModalOpen) {
          setIsPerformingAction(false);
          hardResetForm(initialValues);
        }
      },
      [ renderAsModalContent, isModalOpen, setIsPerformingAction, hardResetForm, initialValues ]
    );


    // ----
    // Merge props and utilities to build form content props
    // ----
    const formContentProps: MutationFormContentProps<D, P, R> = {
      ...props,
      form,
      isEditing,
      isSubmitting: isPerformingAction
    };


    // ----
    // Create the Form Action Helpers
    // ----
    const helpers: MutationFormHelpers<D> = { ...actionHelpers, form, isEditing, isSubmitting: isPerformingAction };


    // ----
    // Mutation Logic
    // ----
    const queriesInvalidator = useQueryInvalidation(formContentProps, invalidateQueries);
    const mutate = useMutation<R, RequestError, D, P>({
      mutationKey,
      onMutate  : () => props,
      onSuccess : queriesInvalidator,
      mutationFn: async (values) => onSubmit(values, helpers, { ...props, isEditing })
    });


    // ----
    // Handlers
    // ----
    const handleFormSubmit: HandleOnSubmit<D> = async (values) => {
      /** Set performing action state */
      setIsPerformingAction(true);

      try {
        /** Parse data removing unknown keys */
        const dataToSend = schema.parse(values);

        /** Use the mutation hook to create the result */
        const result = await mutate.mutateAsync(dataToSend as any);

        /** Check if an onComplete function exists and fire it */
        if (typeof onCompleted === 'function') {
          await onCompleted(result as R, dataToSend, helpers, { ...props, isEditing });
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
            await onSubmitError(error, values, helpers, { ...props, isEditing });
          }
          catch (catchFunctionError) {
            global.console.warn('[ MutationForm ] : an error occurred on onSubmitError handler', catchFunctionError);
          }
        }
      }
      finally {
        /** Remove the performing action state */
        setIsPerformingAction(false);
      }
    };

    const handleFormCancel = async () => {
      /** Set performing action state */
      setIsPerformingAction(true);

      try {
        /** Call the user defined onCancel handler */
        if (typeof onCancel === 'function') {
          await onCancel(helpers, { ...props, isEditing });
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
    const mutationFormActions = useActionButtons(
      {
        key                  : 0,
        builderProps         : formContentProps,
        defaultDefinedBuilder: defaultDefinedCancelButtonBuilder,
        onClick              : handleFormCancel,
        overrideProps        : {
          disabled: isPerformingAction
        },
        userDefined          : userDefinedCancelButton
      },
      {
        key                  : 1,
        builderProps         : formContentProps,
        defaultDefinedBuilder: defaultDefinedSubmitButtonBuilder,
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
        ? defaultDefinedTriggerBuilder(formContentProps)
        : defaultDefinedTriggerBuilder
    );


    // ----
    // Component Building
    // ----
    const formElement = (
      <Form onSubmit={form.onSubmit(handleFormSubmit)}>
        {FormContent && (
          <FormContent {...formContentProps} />
        )}
        {mutationFormActions}
      </Form>
    );


    // ----
    // Component Render
    // ----

    /** Render as Plain Element */
    if (!renderAsModalContent) {
      return (
        <div>
          {Header.create(header, { autoGenerateKey: false })}
          {formElement}
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
        {formElement}
      </Modal>
    );

  };

  MutationForm.displayName = defaultDisplayName;

  return MutationForm;

}


/* --------
 * Using Schema Helpers
 * -------- */
export default function usingSchema<TSchema extends ZodRawShape>(shape: TSchema): UsingSchemaTools<TSchema> {
  return {
    createMutationForm: (configuration) => (
      createMutationForm<InferDto<TSchema>, any, any>(z.object(shape) as any, configuration)
    )
  };
}
