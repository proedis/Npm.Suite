'use client';

import * as React from 'react';

import { Field as FieldPrimitive } from '@base-ui/react/field';

import { splitBaseProps } from '../core/base';
import { cn } from '../core/cn';

import { FieldRequiredProvider } from './fieldContext';

import type { BaseProps } from '../core/base';

import type { FieldSpan } from './FormGrid';


/* --------
 * Types Definition
 * -------- */

export interface StrictFieldProps extends BaseProps {
  /** The visible name of the control. A noun, with no trailing colon */
  label?: React.ReactNode;

  /** Shows the asterisk and declares the control required to assistive technology */
  required?: boolean;

  /** A line under the control with what is worth knowing before typing: a format, a constraint */
  description?: React.ReactNode;

  /**
   * The validation message. When present the field is invalid, and the message **replaces** the
   * description rather than joining it: it says how to fix the value, so it repeats what the
   * description said.
   */
  error?: React.ReactNode;

  /** A count at the end of the message row. Visible only: the announcement is the caller's */
  counter?: React.ReactNode;

  /** Columns taken inside a `FormGrid`. Defaults to 3. Ignored anywhere else */
  span?: FieldSpan;

  /** Inside a `FormGrid`, starts a new row: the first of a group of related fields */
  breakBefore?: boolean;

  /** Disables the control inside */
  disabled?: boolean;

  /** The name the control is submitted under */
  name?: string;

  /** The control */
  children: React.ReactNode;
}

export type FieldProps = StrictFieldProps & Omit<
  React.ComponentProps<'div'>,
  keyof StrictFieldProps | 'color' | 'defaultChecked' | 'defaultValue'
>;


/* --------
 * Constants Definition
 * -------- */

/** One source for the default, because the component both applies it and reports it */
const DEFAULT_SPAN: FieldSpan = 3;

/**
 * The columns a field takes, and where it goes when its grid is narrow.
 *
 * Every class is scoped with `in-data-[slot=form-grid]`, so a span means something only inside a
 * `FormGrid`: a `Field` dropped into any other grid takes one cell like any other child, instead of
 * stretching that grid with three columns it never asked for.
 *
 * Below 32rem of grid width (`@max-lg`, measured on the grid) the short fields take half a row and
 * the others a full one. The classes are literal so the scanner finds them with no safelist.
 */
const SPAN_CLASSES: Readonly<Record<FieldSpan, string>> = {
  1: 'in-data-[slot=form-grid]:col-span-1 @max-lg:in-data-[slot=form-grid]:col-span-3',
  2: 'in-data-[slot=form-grid]:col-span-2 @max-lg:in-data-[slot=form-grid]:col-span-3',
  3: 'in-data-[slot=form-grid]:col-span-3 @max-lg:in-data-[slot=form-grid]:col-span-6',
  4: 'in-data-[slot=form-grid]:col-span-4 @max-lg:in-data-[slot=form-grid]:col-span-6',
  6: 'in-data-[slot=form-grid]:col-span-6'
};


/* --------
 * Internal Components
 * -------- */

/**
 * The mark in front of an error message.
 *
 * Drawn here, not imported: the package carries no icon library, for the same reason `Spinner`
 * exists. An octagon rather than a circle so that an error does not share its outline with an
 * informational note, which in many palettes has the same lightness. It inherits the colour of the
 * message, and an application that wants none hides `[data-slot='field-error-icon']`.
 */
function ErrorGlyph(): React.ReactNode {
  return (
    <svg
      data-slot={'field-error-icon'}
      viewBox={'0 0 24 24'}
      fill={'none'}
      stroke={'currentColor'}
      strokeWidth={2}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
      aria-hidden={'true'}
      focusable={'false'}
      className={'mt-0.5 size-3.5 shrink-0'}
    >
      <path d={'M8 2h8l6 6v8l-6 6H8l-6-6V8z'} />
      <path d={'M12 7.5v5'} />
      <path d={'M12 16.5h.01'} />
    </svg>
  );
}


/* --------
 * Component Definition
 * -------- */

/**
 * What dresses a form control: its label, the asterisk, a description, an error, a counter.
 *
 * ```tsx
 * <Field label={'Subject'} required description={'Up to 80 characters'} error={errors.subject}>
 *   <TextInput />
 * </Field>
 * ```
 *
 * Built on Base UI's `Field`, which owns the part that is easy to get subtly wrong: the label is tied
 * to the control, the description and the error reach it through `aria-describedby`, and the ids are
 * generated rather than invented.
 *
 * Three rows, always in this order, each its own slot: `field-label`, `field-control`,
 * `field-messages`. Inside a `FormGrid` the field is a subgrid over three shared tracks, which is
 * what keeps the controls of one row aligned when a label wraps or an error appears; anywhere else
 * it is a plain stack.
 *
 * ⚠️ `required` reaches the control as `aria-required`, not as the native attribute: validation is
 * the schema's job, and the browser's own bubble would be a second, untranslated error message.
 */
export function Field(props: FieldProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    breakBefore = false,
    children,
    className,
    counter,
    description,
    error,
    label,
    required = false,
    span = DEFAULT_SPAN,
    ...others
  } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Component Render
  // ----
  const hasLabel = label !== null && label !== undefined;
  const hasError = error !== null && error !== undefined && error !== false;
  const hasDescription = !hasError && description !== null && description !== undefined;
  const hasCounter = counter !== null && counter !== undefined;

  return (
    <FieldPrimitive.Root
      data-slot={'field'}
      data-span={span}
      data-break-before={breakBefore || undefined}
      data-required={required || undefined}
      invalid={hasError}
      className={cn(
        'grid min-w-0 content-start gap-y-1',
        'in-data-[slot=form-grid]:row-span-3 in-data-[slot=form-grid]:grid-rows-subgrid',
        SPAN_CLASSES[span],
        breakBefore && 'in-data-[slot=form-grid]:col-start-1',
        baseClasses,
        className
      )}
      {...rest}
    >
      {hasLabel && (
        /* The line height comes AFTER the size: a size carries its own, and tailwind-merge drops
           whichever of the two comes first */
        <FieldPrimitive.Label
          data-slot={'field-label'}
          className={'self-end text-sm leading-snug font-medium text-foreground'}
        >
          {label}
          {required && (
            <span data-slot={'field-required'} aria-hidden={'true'} className={'ms-0.5 text-destructive'}>*</span>
          )}
        </FieldPrimitive.Label>
      )}

      <div data-slot={'field-control'} className={'min-w-0 in-data-[slot=form-grid]:row-start-2'}>
        <FieldRequiredProvider value={required}>
          {children}
        </FieldRequiredProvider>
      </div>

      {(hasError || hasDescription || hasCounter) && (
        <div
          data-slot={'field-messages'}
          className={'flex min-w-0 items-start gap-2 self-start text-xs in-data-[slot=form-grid]:row-start-3'}
        >
          {hasError && (
            /*
             * `match` is `true` because the message came from the caller (a schema, a server
             * response), not from the browser's constraint validation: without it Base UI hides the
             * error until a ValidityState key matches.
             */
            <FieldPrimitive.Error
              data-slot={'field-error'}
              match={true}
              className={'flex min-w-0 flex-1 items-start gap-1 text-destructive'}
            >
              <ErrorGlyph />
              <span className={'min-w-0'}>{error}</span>
            </FieldPrimitive.Error>
          )}

          {hasDescription && (
            <FieldPrimitive.Description
              data-slot={'field-description'}
              className={'min-w-0 flex-1 text-muted-foreground'}
            >
              {description}
            </FieldPrimitive.Description>
          )}

          {hasCounter && (
            <span
              data-slot={'field-counter'}
              aria-hidden={'true'}
              className={'ms-auto shrink-0 text-muted-foreground tabular-nums'}
            >
              {counter}
            </span>
          )}
        </div>
      )}
    </FieldPrimitive.Root>
  );

}

Field.displayName = 'Field';
