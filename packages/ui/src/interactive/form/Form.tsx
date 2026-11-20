'use client';

import * as React from 'react';

import { optionalContextBuilder } from '@proedis/react';

import { splitBaseProps } from '../../core/base';
import { cn } from '../../core/cn';

import { Button } from '../button/Button';
import { FormErrorRegistryContext, FormSectionContext, useFormHostContext } from '../field/fieldContext';

import type { BaseProps } from '../../core/base';

import type { ButtonProps } from '../button/Button';
import type { FormErrorEntry, FormErrorRegistry } from '../field/fieldContext';


/* --------
 * Types Definition
 * -------- */

export type FormHeadingLevel = 2 | 3 | 4 | 5 | 6;

export type FormProps = BaseProps & Omit<React.ComponentProps<'form'>, 'noValidate'>;

export interface FormHeaderProps extends BaseProps, Omit<React.ComponentProps<'div'>, 'title'> {
  /** The title of a form in a page */
  title?: React.ReactNode;

  /** A line under the title */
  description?: React.ReactNode;

  /** Defaults to 2, under the title of the page */
  headingLevel?: FormHeadingLevel;
}

export interface FormErrorSummaryProps extends BaseProps, Omit<React.ComponentProps<'div'>, 'title' | 'children'> {
  /**
   * The heading of the summary, from the number of errors: the package writes no text, and a count
   * needs the caller's plural rules.
   */
  title: (count: number) => React.ReactNode;
}

export interface FormSectionProps extends BaseProps, Omit<React.ComponentProps<'div'>, 'title'> {
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

export type FormFooterProps = BaseProps & React.ComponentProps<'div'>;

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


/* --------
 * Context Definition
 * -------- */

const [ FormErrorStateContext, useFormErrorStateContext ] = optionalContextBuilder<FormErrorState | null>('FormErrorState', null);


/* --------
 * Helpers
 * -------- */

function isPresent(node: React.ReactNode): boolean {
  return node !== null && node !== undefined && node !== false && node !== '';
}


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
    <div {...rest} data-slot={'form-header'} className={cn('flex flex-col gap-1', baseClasses, className)}>
      {isPresent(title) && (
        <Title data-slot={'form-header-title'} className={'text-base font-semibold text-foreground'}>{title}</Title>
      )}

      {isPresent(description) && (
        <p data-slot={'form-header-description'} className={'text-sm text-muted-foreground'}>{description}</p>
      )}

      {children}
    </div>
  );

}

FormHeader.displayName = 'Form.Header';


/**
 * The list of what is wrong, shown from two errors up, with a link to each field.
 *
 * Placed by whoever writes the form, normally at the top. On a submit that ends with two or more
 * errors the focus lands here; with one it goes straight to the field. Each line is the `summary` of
 * its `Field.Error`, or its message.
 */
function FormErrorSummary(props: FormErrorSummaryProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { className, title, ...others } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Internal Hooks
  // ----
  const state = useFormErrorStateContext();
  const titleId = React.useId();


  // ----
  // Component Render
  // ----
  if (!state || state.errors.length < SUMMARY_THRESHOLD) {
    return null;
  }

  const { errors, summaryRef } = state;

  return (
    <div
      {...rest}
      ref={summaryRef}
      tabIndex={-1}
      role={'group'}
      aria-labelledby={titleId}
      data-slot={'form-error-summary'}
      className={cn(
        'flex flex-col gap-1 rounded-md bg-destructive-soft p-3 text-sm text-destructive-soft-foreground',
        'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        baseClasses,
        className
      )}
    >
      <p id={titleId} data-slot={'form-error-summary-title'} className={'font-semibold'}>
        {title(errors.length)}
      </p>

      <ul data-slot={'form-error-summary-list'} className={'flex flex-col gap-0.5'}>
        {errors.map((error) => (
          <li key={error.fieldId}>
            <a
              href={`#${error.fieldId}`}
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
      </ul>
    </div>
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
        '@container grid grid-cols-6 gap-x-6 gap-y-5 border-border',
        '[[data-slot=form-section]+&]:mt-6 [[data-slot=form-section]+&]:border-t [[data-slot=form-section]+&]:pt-6',
        baseClasses,
        className
      )}
    >
      {hasTitle && (
        <div data-slot={'form-section-header'} className={'col-span-6 flex flex-col gap-0.5'}>
          <Title id={titleId} data-slot={'form-section-title'} className={'text-sm font-semibold text-foreground'}>
            {title}
          </Title>

          {hasDescription && (
            <p id={descriptionId} data-slot={'form-section-description'} className={'text-sm text-muted-foreground'}>
              {description}
            </p>
          )}
        </div>
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
    <div
      {...rest}
      data-slot={'form-footer'}
      className={cn('flex flex-wrap items-center justify-end gap-2', baseClasses, className)}
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
 *     <Field span={4}>
 *       <Field.Label required>Street</Field.Label>
 *       <TextInput width={'long'} />
 *       <Field.Error>{errors.street}</Field.Error>
 *     </Field>
 *   </Form.Section>
 * </Form>
 * ```
 *
 * It does not validate and picks no validation library: the errors come from the caller, as
 * `Field.Error`s. What it does is what follows a submit. Once the caller's errors are on screen the
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
export function Form(props: FormProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { className, onInput, onSubmit, ...others } = props;

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
    <form
      {...rest}
      id={rest.id ?? host?.formId}
      noValidate
      data-slot={'form'}
      className={cn('flex flex-col gap-6', baseClasses, className)}
      onSubmit={handleSubmit}
      onInput={handleInput}
    >
      <FormErrorRegistryContext.Provider value={registry}>
        <FormErrorStateContext.Provider value={errorState}>
          {rest.children}
        </FormErrorStateContext.Provider>
      </FormErrorRegistryContext.Provider>
    </form>
  );

}

Form.displayName = 'Form';

Form.Header = FormHeader;
Form.ErrorSummary = FormErrorSummary;
Form.Section = FormSection;
Form.Footer = FormFooter;


/**
 * The submit button of the form of a popover, a dialog or a drawer: it sits in their footer, outside
 * the `<form>`, and points at it through the `form` attribute. Enter in a field submits through it.
 *
 * ```tsx
 * <Dialog footer={<FormSubmit loading={saving} loadingLabel={'Saving'}>Save</FormSubmit>}>
 *   <Form onSubmit={save}>…</Form>
 * </Dialog>
 * ```
 */
export const FormSubmit = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const host = useFormHostContext();

  return <Button {...props} ref={ref} type={'submit'} form={props.form ?? host?.formId} />;
});

FormSubmit.displayName = 'FormSubmit';
