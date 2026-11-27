'use client';

import * as React from 'react';

import { optionalContextBuilder, useForkRef } from '@proedis/react';

import { splitBaseProps } from '../../core/base';
import { cn } from '../../core/cn';

import { Stack } from '../../layout/Stack';

import { isPresent } from '../../internal/presence';

import { Button } from '../../actions/button/Button';

import { FormErrorRegistryContext, FormSectionContext, useFormHostContext } from '../field/fieldContext';

import type { BaseProps } from '../../core/base';

import type { ButtonProps, StrictButtonProps } from '../../actions/button/Button';

import type { FormErrorEntry, FormErrorRegistry } from '../field/fieldContext';


/* --------
 * Types Definition
 * -------- */

export type FormHeadingLevel = 2 | 3 | 4 | 5 | 6;

export interface StrictFormProps extends BaseProps {
  /**
   * The form is being sent: `Form.Submit` spins and the dialog or drawer around the form waits, with
   * nothing closing it. From the caller's state, never a state of its own: `isSubmitting` of a form library
   */
  submitting?: boolean;

  /**
   * The form was changed: the dialog or drawer around it asks before closing, with the texts of its
   * `discard`. From the caller's state: `isDirty` of a form library
   */
  dirty?: boolean;
}

export type FormProps = StrictFormProps & Omit<React.ComponentProps<'form'>, keyof StrictFormProps | 'noValidate' | 'ref'>;

/** The submit button of a form, wherever it sits: `loadingLabel` is required, since any submit may spin */
export interface StrictFormSubmitProps {
  /** Spins without the form saying so: a submit that is not the form's own */
  loading?: boolean;

  /** What the spinner says while the form is sent: "Saving" */
  loadingLabel: string;
}

export type FormSubmitProps = StrictFormSubmitProps & Omit<ButtonProps, 'type' | 'loading' | 'loadingLabel'>;

/** The way out of a form: through the overlay's gate in a dialog or a drawer, a reset in a page */
export type StrictFormCancelProps = StrictButtonProps;

export type FormCancelProps = Omit<ButtonProps, 'type'>;

export interface StrictFormHeaderProps extends BaseProps {
  /** The title of a form in a page */
  title?: React.ReactNode;

  /** A line under the title */
  description?: React.ReactNode;

  /** Defaults to 2, under the title of the page */
  headingLevel?: FormHeadingLevel;
}

export type FormHeaderProps = StrictFormHeaderProps & Omit<React.ComponentProps<'div'>, keyof StrictFormHeaderProps>;

export interface StrictFormErrorSummaryProps extends BaseProps {
  /**
   * The heading of the summary, from the number of errors: the package writes no text, and a count
   * needs the caller's plural rules.
   */
  title: (count: number) => React.ReactNode;
}

export type FormErrorSummaryProps = StrictFormErrorSummaryProps & Omit<
  React.ComponentProps<'div'>,
  keyof StrictFormErrorSummaryProps | 'children'
>;

export interface StrictFormSectionProps extends BaseProps {
  /**
   * The title. Without it the section is the only one of its form, named by its container: it then
   * carries no group role either.
   */
  title?: React.ReactNode;

  /** One line on what the section is for, never on how to fill it in */
  description?: React.ReactNode;

  /** Defaults to 3, under the title of the dialog, drawer or page around the form */
  headingLevel?: FormHeadingLevel;
}

export type FormSectionProps = StrictFormSectionProps & Omit<React.ComponentProps<'div'>, keyof StrictFormSectionProps>;

export type StrictFormFooterProps = BaseProps;

export type FormFooterProps = StrictFormFooterProps & Omit<React.ComponentProps<'div'>, keyof StrictFormFooterProps>;

interface FormErrorState {
  /** Every error of the form, in the order they are on screen */
  readonly errors: readonly FormErrorEntry[];

  /** Where the summary hands its element, so the form can move the focus to it */
  readonly summaryRef: React.RefObject<HTMLDivElement | null>;
}


/* --------
 * Constants Definition
 * -------- */

const HEADING_ELEMENT = {
  2: 'h2',
  3: 'h3',
  4: 'h4',
  5: 'h5',
  6: 'h6'
} as const;

/** From this many errors the focus goes to the summary instead of the first field */
const SUMMARY_THRESHOLD = 2;

/**
 * A section: six columns, a column gap apart from the row gap, and the container a field measures to
 * collapse its span (`@max-lg`). The fields become subgrids of its rows.
 */
// eslint-disable-next-line no-restricted-syntax -- gap-x apart from gap-y, and the container the spans of the fields query
const SECTION_GRID = '@container grid grid-cols-6 gap-x-6 gap-y-5 border-border';


/* --------
 * Context Definition
 * -------- */

const [ FormErrorStateContext, useFormErrorStateContext ] = optionalContextBuilder<FormErrorState | null>('FormErrorState', null);

/** The state of the form around a button, for `Form.Submit` and `Form.Cancel` inside it */
interface FormStatus {
  readonly formId: string | undefined;
  readonly submitting: boolean;
  readonly dirty: boolean;
}

const [ FormStatusContext, useFormStatusContext ] = optionalContextBuilder<FormStatus | null>('FormStatus', null);


/**
 * Where a button of a form reads it from: the form around it, or, in the footer of an overlay outside
 * the `<form>`, what the form reported to the overlay.
 */
function useFormStatus(): FormStatus {
  const own = useFormStatusContext();
  const host = useFormHostContext();

  return own ?? { formId: host?.formId, submitting: host?.state.submitting ?? false, dirty: host?.state.dirty ?? false };
}


/* --------
 * Helpers
 * -------- */

/** Errors in the order of their fields on screen, which is the order of the Tab */
function byDocumentPosition(first: FormErrorEntry, second: FormErrorEntry): number {
  const a = first.getElement();
  const b = second.getElement();

  if (!a || !b || a === b) {
    return 0;
  }

  const position = a.compareDocumentPosition(b);

  /* Following, or following and inside: either way `b` comes after `a` on screen */
  const follows = position === Node.DOCUMENT_POSITION_FOLLOWING
    || position === Node.DOCUMENT_POSITION_FOLLOWING + Node.DOCUMENT_POSITION_CONTAINED_BY;

  return follows ? -1 : 1;
}


/* --------
 * Parts
 * -------- */

/**
 * The title and the description of a form that stands in a page.
 *
 * In a dialog or a drawer the container has its own header, and this part is not used: the form does
 * not know what it is mounted in.
 */
function FormHeader(props: FormHeaderProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    children,
    className,
    description,
    headingLevel = 2,
    title,
    ...others
  } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Component Render
  // ----
  const Title = HEADING_ELEMENT[headingLevel];

  return (
    <Stack {...rest} data-slot={'form-header'} gap={1} className={cn(baseClasses, className)}>
      {isPresent(title) && (
        <Title data-slot={'form-header-title'} className={'text-base font-semibold text-foreground'}>{title}</Title>
      )}

      {isPresent(description) && (
        <p data-slot={'form-header-description'} className={'text-sm text-muted-foreground'}>{description}</p>
      )}

      {children}
    </Stack>
  );

}

FormHeader.displayName = 'Form.Header';


/**
 * The list of what is wrong, shown from two errors up, with a link to each field.
 *
 * Placed by whoever writes the form, normally at the top. On a submit that ends with two or more
 * errors the focus lands here; with one it goes straight to the field. Each line is the `summary` of
 * its field's `errorSummary`, or its `error`.
 */
function FormErrorSummary(props: FormErrorSummaryProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { className, ref, title, ...others } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Internal Hooks
  // ----
  const state = useFormErrorStateContext();
  const titleId = React.useId();
  const handleRef = useForkRef(state?.summaryRef, ref as React.Ref<HTMLDivElement> | undefined);


  // ----
  // Component Render
  // ----
  if (!state || state.errors.length < SUMMARY_THRESHOLD) {
    return null;
  }

  const { errors } = state;

  return (
    <Stack
      {...rest}
      ref={handleRef}
      tabIndex={-1}
      role={'group'}
      aria-labelledby={titleId}
      data-slot={'form-error-summary'}
      gap={1}
      className={cn(
        'rounded-md bg-destructive-soft p-3 text-sm text-destructive-soft-foreground',
        'outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring',
        baseClasses,
        className
      )}
    >
      <p id={titleId} data-slot={'form-error-summary-title'} className={'font-semibold'}>
        {title(errors.length)}
      </p>

      <Stack as={'ul'} data-slot={'form-error-summary-list'} gap={0.5}>
        {errors.map((error) => (
          <li key={error.fieldId} data-slot={'form-error-summary-item'}>
            <a
              href={`#${error.fieldId}`}
              data-slot={'form-error-summary-link'}
              className={'underline underline-offset-2'}
              onClick={(event) => {
                event.preventDefault();
                error.focusControl();
              }}
            >
              {error.summary}
            </a>
          </li>
        ))}
      </Stack>
    </Stack>
  );

}

FormErrorSummary.displayName = 'Form.ErrorSummary';


/**
 * A group of fields, laid on a grid of six columns, with a title and a line of explanation over it.
 *
 * ```tsx
 * <Form.Section title={'Address'} description={'Where the collection takes place'}>
 *   <Field span={4}>…</Field>
 *   <Field span={2}>…</Field>
 * </Form.Section>
 * ```
 *
 * A `div` with `role="group"`, named by its title and described by its explanation, rather than a
 * `section`: a named `section` is a landmark, and a form of four sections would put four landmarks in
 * the page. The `fieldset` stays around a group of radios or checkboxes.
 *
 * The width of a field comes from its `span`. Below 32rem of section, measured on the section and not
 * on the window, the short fields take half a row and the others a whole one. Two sections in a row
 * are separated by a rule with room on both sides.
 *
 * The section **is** the grid, so a class on it reaches the columns: `gap-x-10!` on one section is the
 * instance lever over a product's skin. The header is its first row, across the six columns.
 *
 * Slots: `form-section` (the grid), `form-section-header`, `form-section-title`,
 * `form-section-description`.
 */
function FormSection(props: FormSectionProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    children,
    className,
    description,
    headingLevel = 3,
    title,
    ...others
  } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Internal Hooks
  // ----
  const titleId = React.useId();
  const descriptionId = React.useId();


  // ----
  // Component Render
  // ----
  const hasTitle = isPresent(title);
  const hasDescription = hasTitle && isPresent(description);

  const Title = HEADING_ELEMENT[headingLevel];

  return (
    <div
      {...rest}
      data-slot={'form-section'}
      role={hasTitle ? 'group' : undefined}
      aria-labelledby={hasTitle ? titleId : undefined}
      aria-describedby={hasDescription ? descriptionId : undefined}
      className={cn(
        SECTION_GRID,
        '[[data-slot=form-section]+&]:mt-6 [[data-slot=form-section]+&]:border-t [[data-slot=form-section]+&]:pt-6',
        baseClasses,
        className
      )}
    >
      {hasTitle && (
        <Stack data-slot={'form-section-header'} gap={0.5} className={'col-span-6'}>
          <Title id={titleId} data-slot={'form-section-title'} className={'text-sm font-semibold text-foreground'}>
            {title}
          </Title>

          {hasDescription && (
            <p id={descriptionId} data-slot={'form-section-description'} className={'text-sm text-muted-foreground'}>
              {description}
            </p>
          )}
        </Stack>
      )}

      <FormSectionContext.Provider value={true}>
        {children}
      </FormSectionContext.Provider>
    </div>
  );

}

FormSection.displayName = 'Form.Section';


/**
 * The actions of a form that stands in a page, at its end, on the right.
 *
 * In a dialog or a drawer the container's footer holds them, and the submit button points at the form
 * with `form={id}`.
 */
function FormFooter(props: FormFooterProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { className, ...others } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Component Render
  // ----
  return (
    <Stack
      {...rest}
      data-slot={'form-footer'}
      direction={'horizontal'}
      wrap
      align={'center'}
      justify={'end'}
      gap={2}
      className={cn(baseClasses, className)}
    />
  );

}

FormFooter.displayName = 'Form.Footer';


/* --------
 * Component Definition
 * -------- */

/**
 * A real `<form>`, made of parts: header, error summary, sections of fields, footer.
 *
 * ```tsx
 * <Form id={'signal'} onSubmit={handleSubmit}>
 *   <Form.ErrorSummary title={(count) => t('FORM.ERRORS', { count })} />
 *   <Form.Section title={'Address'}>
 *     <Field span={4} required label={'Street'} error={errors.street}>
 *       <TextInput width={'long'} />
 *     </Field>
 *   </Form.Section>
 * </Form>
 * ```
 *
 * It does not validate and picks no validation library: the errors come from the caller, as
 * `error` of each `Field`. What it does is what follows a submit. Once the caller's errors are on screen the
 * focus goes to the error summary when there are two or more and a summary is mounted, otherwise to
 * the first invalid field, in the order of the screen. The errors may arrive later than the submit
 * (an answer from the server): the form waits for them until the user types again.
 *
 * `noValidate` always: the browser's bubbles would be a second, untranslated set of messages.
 * `onSubmit` is the native one, so a single page application calls `preventDefault` itself.
 *
 * Not Base UI's `Form`, deliberately: that one stops the submit while a field is invalid, which with
 * errors owned by the caller means a second submit never reaches the caller.
 */
const FormRoot = React.forwardRef<HTMLFormElement, FormProps>((props, ref) => {

  // ----
  // Props Deconstruct
  // ----
  const { className, dirty = false, onInput, onSubmit, submitting = false, ...others } = props;

  const { baseClasses, rest } = splitBaseProps(others);

  /* In a popover, a dialog or a drawer the id comes from it, and its submit button points here */
  const host = useFormHostContext();


  // ----
  // Internal State
  // ----
  const summaryRef = React.useRef<HTMLDivElement>(null);
  const pendingFocusRef = React.useRef(false);

  /** The same entries, current at any moment: the state below is what renders, this is what the focus reads */
  const liveEntriesRef = React.useRef(new Map<string, FormErrorEntry>());

  const [ entries, setEntries ] = React.useState<ReadonlyMap<string, FormErrorEntry>>(() => new Map());
  const [ submitCount, setSubmitCount ] = React.useState(0);


  // ----
  // Memoized Data
  // ----
  const registry = React.useMemo<FormErrorRegistry>(() => ({
    register: (id, entry) => {
      liveEntriesRef.current.set(id, entry);
      setEntries((current) => new Map(current).set(id, entry));

      return () => {
        liveEntriesRef.current.delete(id);
        setEntries((current) => {
          const next = new Map(current);

          next.delete(id);

          return next;
        });
      };
    }
  }), []);

  const errors = React.useMemo(() => [ ...entries.values() ].sort(byDocumentPosition), [ entries ]);

  const errorState = React.useMemo<FormErrorState>(() => ({ errors, summaryRef }), [ errors ]);

  const formId = rest.id ?? host?.formId;

  /* Memoised by the compiler: a value written by hand here could not be kept */
  const status: FormStatus = { formId, submitting, dirty };


  // ----
  // Lifecycle Events
  // ----
  /*
   * One task later, and from the live entries: errors that disappear unregister in a render of their
   * own, so the render that runs this effect first may still count the old ones. Deciding then would
   * focus a summary that is about to go away. A timeout rather than an animation frame, which a
   * background tab never fires.
   */
  React.useEffect(() => {
    if (!pendingFocusRef.current) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      const live = [ ...liveEntriesRef.current.values() ].sort(byDocumentPosition);

      if (!pendingFocusRef.current || !live.length) {
        return;
      }

      pendingFocusRef.current = false;

      if (live.length >= SUMMARY_THRESHOLD && summaryRef.current) {
        summaryRef.current.focus();
        return;
      }

      live[0].focusControl();
    });

    return () => window.clearTimeout(timer);
  }, [ errors, submitCount ]);


  /* The overlay around the form waits while it is sent and asks before closing it changed */
  const report = host?.report;

  React.useEffect(() => {
    report?.({ submitting, dirty });
  }, [ report, submitting, dirty ]);

  React.useEffect(() => () => report?.({ submitting: false, dirty: false }), [ report ]);


  // ----
  // Handlers
  // ----
  const handleSubmit: NonNullable<FormProps['onSubmit']> = (event) => {
    pendingFocusRef.current = true;
    setSubmitCount((current) => current + 1);
    onSubmit?.(event);
  };

  /** Once the user types again, an error that arrives late must not pull the focus away */
  const handleInput: NonNullable<FormProps['onInput']> = (event) => {
    pendingFocusRef.current = false;
    onInput?.(event);
  };


  // ----
  // Component Render
  // ----
  return (
    <Stack
      as={'form'}
      {...rest}
      ref={ref}
      id={formId}
      noValidate
      data-slot={'form'}
      data-submitting={submitting || undefined}
      data-dirty={dirty || undefined}
      gap={6}
      className={cn(baseClasses, className)}
      onSubmit={handleSubmit}
      onInput={handleInput}
    >
      <FormErrorRegistryContext.Provider value={registry}>
        <FormErrorStateContext.Provider value={errorState}>
          <FormStatusContext.Provider value={status}>
            {rest.children}
          </FormStatusContext.Provider>
        </FormErrorStateContext.Provider>
      </FormErrorRegistryContext.Provider>
    </Stack>
  );

});

FormRoot.displayName = 'Form';

/**
 * The submit button of a form, inside it or in the footer of the dialog, drawer or popover it sits in:
 * there it points at the form through the `form` attribute, and Enter in a field submits through it.
 *
 * ```tsx
 * <Form submitting={isSubmitting} onSubmit={save}>…<Form.Submit loadingLabel={'Saving'}>Save</Form.Submit></Form>
 * <Dialog footer={<Form.Submit loadingLabel={'Saving'}>Save</Form.Submit>}><Form …>…</Form></Dialog>
 * ```
 *
 * It spins on its own while the form is `submitting`, which is why `loadingLabel` is required: a submit
 * that turns into a spinner and says nothing is a button that went quiet.
 */
export const FormSubmit = React.forwardRef<HTMLButtonElement, FormSubmitProps>((props, ref) => {
  const { loading = false, loadingLabel, ...rest } = props;
  const status = useFormStatus();

  return (
    <Button
      {...(rest as ButtonProps)}
      ref={ref}
      type={'submit'}
      form={rest.form ?? status.formId}
      loading={loading || status.submitting}
      loadingLabel={loadingLabel}
    />
  );
});

FormSubmit.displayName = 'Form.Submit';


/**
 * The way out of a form. In a dialog, a drawer or a popover it goes through the overlay's gate: it
 * closes, or asks first when the form was changed, and does nothing while the form is sent. In a page
 * it is a reset of the form, which a form library listens to through `onReset`.
 *
 * The caller's click runs first, and a `preventDefault` in it keeps everything as it is.
 */
export const FormCancel = React.forwardRef<HTMLButtonElement, FormCancelProps>((props, ref) => {
  const { onClick, ...rest } = props;
  const status = useFormStatus();
  const host = useFormHostContext();
  const requestClose = host?.requestClose;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    onClick?.(event as Parameters<NonNullable<typeof onClick>>[0]);

    if (event.defaultPrevented || !requestClose) {
      return;
    }

    event.preventDefault();
    requestClose();
  };

  return (
    <Button
      fill={'solid'}
      tone={'secondary'}
      {...(rest as ButtonProps)}
      ref={ref}
      type={requestClose ? 'button' : 'reset'}
      form={requestClose ? undefined : (rest.form ?? status.formId)}
      disabled={rest.disabled || status.submitting}
      onClick={handleClick}
    />
  );
});

FormCancel.displayName = 'Form.Cancel';


export const Form = Object.assign(FormRoot, {
  Header      : FormHeader,
  ErrorSummary: FormErrorSummary,
  Section     : FormSection,
  Footer      : FormFooter,
  Submit      : FormSubmit,
  Cancel      : FormCancel
});
