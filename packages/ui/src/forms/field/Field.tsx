'use client';

import * as React from 'react';

import { Field as FieldPrimitive } from '@base-ui/react/field';

import { useEnhancedEffect, useForkRef } from '@proedis/react';

import { splitBaseProps } from '../../core/base';
import { cn } from '../../core/cn';
import { responsiveClasses, toResponsiveMap } from '../../core/responsive';

import { Stack } from '../../layout/Stack';

import { Label } from '../../primitives/Label';

import { StatusGlyph } from '../../internal/glyphs';
import { isPresent } from '../../internal/presence';


import {
  FieldControlContext,
  FieldLabelNativeContext,
  FieldRegistryContext,
  useFormErrorRegistryContext,
  useFormSectionContext
} from './fieldContext';

import type { BaseProps } from '../../core/base';
import type { Direction, Responsive } from '../../core/responsive';

import type { ToneGlyphTone } from '../../internal/glyphs';

import type { FieldControlState, FieldRegistry, FieldStatus } from './fieldContext';


/* --------
 * Types Definition
 * -------- */

/** Columns a field takes in a form section of six */
export type FieldSpan = 1 | 2 | 3 | 4 | 6;

export interface StrictFieldProps extends BaseProps {
  /** The name of the field, tied to the control: a noun, with no trailing colon */
  label?: React.ReactNode;

  /**
   * What is worth knowing before typing, under the label and above the control: a format, a
   * constraint, what the value is for. It stays when the field shows a message
   */
  description?: React.ReactNode;

  /**
   * A line under the control: a reminder while typing, an example. The message of a status takes
   * its place, in a line of the same height, so the swap moves nothing
   */
  hint?: React.ReactNode;

  /**
   * The error, from the caller: a schema, a server answer. With content the status is `error`, the
   * control `aria-invalid`, and the message replaces the hint; empty (`null`, `undefined`, `false`,
   * `''`) the field is valid again. Inside a `Form` it reaches the form's error summary too
   */
  error?: React.ReactNode;

  /**
   * What the summary of the form says for this field, when it differs from the error: the error under a
   * short field is one or two words ("5 digits"), the summary line names the field ("ZIP code: it must
   * have 5 digits"). Defaults to the error
   */
  errorSummary?: React.ReactNode;

  /**
   * A status without an error: `warning` for a value that is accepted but worth a look, `success` for
   * one checked. It colours the frame of the control and `message`. `error` wins over it
   */
  status?: FieldStatus;

  /** The message of a `warning` or `success` status, under the control in place of the hint */
  message?: React.ReactNode;

  /** Shows the asterisk and makes the control `aria-required`. Validation stays with the caller */
  required?: boolean;

  /**
   * The word after the name of a field that may stay empty, in the language of the page: "optional".
   * The convention of a form where almost everything is required. Not shown with `required`
   */
  optional?: React.ReactNode;

  /** A glyph before the label, as tall as its text. A node: this package imports no icon library */
  icon?: React.ReactNode;

  /** A count at the end of the message row, there with or without a message: "12 / 50" */
  counter?: React.ReactNode;

  /** The count is past the limit: it turns to the colour of an error */
  counterExceeded?: boolean;

  /**
   * Columns taken inside a `Form.Section`. Defaults to 3. Ignored anywhere else.
   *
   * One value lets the section decide below 32rem of its own width: the short fields take half a row,
   * the others a whole one. A map per breakpoint of the window is the caller's decision at every width,
   * and the section no longer steps in: `{ base: 6, md: 3, xl: 2 }`.
   */
  span?: Responsive<FieldSpan>;

  /** Inside a `Form.Section`, starts a new row: the first of a group of related fields. Per breakpoint too */
  breakBefore?: Responsive<boolean>;

  /**
   * `horizontal` puts the label and its description beside the control, a third of the width, and the
   * message under the control: `{ base: 'vertical', md: 'horizontal' }` keeps it above on a phone.
   * Defaults to `vertical`. Ignored in a `Form.Section`, whose grid aligns the labels of a row
   */
  orientation?: Responsive<Direction>;

  /** Disables the control inside */
  disabled?: boolean;

  /** The name the control is submitted under */
  name?: string;

  /** The control, one: everything else is a prop of the field */
  children?: React.ReactNode;
}

export type FieldProps = StrictFieldProps & Omit<
  React.ComponentProps<'div'>,
  keyof StrictFieldProps | 'color' | 'defaultChecked' | 'defaultValue'
>;


/* --------
 * Constants Definition
 * -------- */

/**
 * The default span of each kind of text field, for a form builder that knows the kind and not the
 * number. Exported for that, and the source of the `width` of `TextInput`.
 */
export const FIELD_SPAN = {
  'text-short': 1,
  'text-code' : 2,
  text        : 3,
  'text-long' : 4
} as const satisfies Readonly<Record<string, FieldSpan>>;

const DEFAULT_SPAN: FieldSpan = 3;

/**
 * The columns a field takes, and where it goes when its section is narrow.
 *
 * Scoped with `in-data-[slot=form-section]`, so a span means something only in a form section:
 * a `Field` dropped into any other grid takes one cell like any other child. Below 32rem of section
 * (`@max-lg`, measured on the section) the short fields take half a row and the others a whole one.
 */
const SPAN_CLASSES: Readonly<Record<FieldSpan, string>> = {
  1: 'in-data-[slot=form-section]:col-span-1 @max-lg:in-data-[slot=form-section]:col-span-3',
  2: 'in-data-[slot=form-section]:col-span-2 @max-lg:in-data-[slot=form-section]:col-span-3',
  3: 'in-data-[slot=form-section]:col-span-3 @max-lg:in-data-[slot=form-section]:col-span-6',
  4: 'in-data-[slot=form-section]:col-span-4 @max-lg:in-data-[slot=form-section]:col-span-6',
  6: 'in-data-[slot=form-section]:col-span-6'
};

/**
 * The span of a map, one class per breakpoint and no fallback. Without a prefix of its own on the
 * section selector, so the breakpoint prefix goes first: `md:in-data-[slot=form-section]:col-span-3`.
 * Each one is declared in `theme.css`, since the scanner cannot read a class built here.
 */
function spanClasses(span: Responsive<FieldSpan>): string[] {
  if (typeof span !== 'object') {
    return [ SPAN_CLASSES[span] ];
  }

  return responsiveClasses({ base: DEFAULT_SPAN, ...span }, (value) => `in-data-[slot=form-section]:col-span-${value}`);
}

/**
 * Where the parts go per orientation. Each set says everything the other one sets, so a field that
 * turns at a breakpoint keeps nothing of the other layout: the columns, the gap, the cell and the row
 * of every part. `vertical` is the layout of `PART_PLACEMENT`, written again for a map that comes back
 * to it. The label is a column (its name over its description), moved with `justify-*`. Each class,
 * with every breakpoint prefix, is declared in `theme.css`.
 */
/* eslint-disable no-restricted-syntax -- grid placement of the parts: named tracks, gap-x apart, declared in theme.css */
const ORIENTATION_LAYOUT: Readonly<Record<Direction, string>> = {
  horizontal: [
    'grid-cols-field-horizontal gap-x-4',
    '*:col-start-2 *:col-span-2 *:row-start-1',
    '*:data-[slot=field-label]:col-start-1 *:data-[slot=field-label]:col-span-1 *:data-[slot=field-label]:row-start-1',
    '*:data-[slot=field-label]:min-h-control-md *:data-[slot=field-label]:justify-center *:data-[slot=field-label]:self-start',
    '*:data-[slot=field-message]:col-start-2 *:data-[slot=field-message]:row-start-2',
    '*:data-[slot=field-counter]:col-start-3 *:data-[slot=field-counter]:row-start-2'
  ].join(' '),
  vertical: [
    'grid-cols-field gap-x-2',
    '*:col-start-auto *:col-span-2 *:row-start-auto',
    '*:data-[slot=field-label]:col-start-auto *:data-[slot=field-label]:col-span-2 *:data-[slot=field-label]:row-start-auto',
    '*:data-[slot=field-label]:min-h-0 *:data-[slot=field-label]:justify-start *:data-[slot=field-label]:self-end',
    '*:data-[slot=field-message]:col-start-1 *:data-[slot=field-message]:row-start-auto',
    '*:data-[slot=field-counter]:col-start-2 *:data-[slot=field-counter]:row-start-auto'
  ].join(' ')
};
/* eslint-enable no-restricted-syntax */

/** The orientation out of a section: nothing for the vertical of `base`, which is the default layout */
function orientationClasses(orientation: Responsive<Direction>): string[] {
  const map = { ...toResponsiveMap(orientation) };

  if (map.base === 'vertical') {
    delete map.base;
  }

  return responsiveClasses(map, (value) => ORIENTATION_LAYOUT[value]);
}

/** The new row, with `col-start-auto` undoing it at a breakpoint that does not want it */
function breakClasses(breakBefore: Responsive<boolean>): string[] {
  if (typeof breakBefore !== 'object') {
    return breakBefore ? [ 'in-data-[slot=form-section]:col-start-1' ] : [];
  }

  return responsiveClasses(breakBefore, (value) => (
    value ? 'in-data-[slot=form-section]:col-start-1' : 'in-data-[slot=form-section]:col-start-auto'
  ));
}

/**
 * The field itself: a grid of named tracks (`grid-cols-field`), with a column gap apart from the row
 * gap, which a form section turns into a subgrid of its rows. None of it is a Stack.
 */
// eslint-disable-next-line no-restricted-syntax -- named tracks and a subgrid, gap-x apart from gap-y
const FIELD_GRID = 'grid min-w-0 grid-cols-field content-start gap-x-2 gap-y-1';

/**
 * Where each part goes, by its slot and not by the order it is rendered in.
 *
 * Two columns, the message and the counter at its end; the label and the control take both. Three
 * rows: label (with its description), control, message. Alone, the rows come from `order`, so a field
 * with no label has no empty row on top. In a section the field is a subgrid over three tracks the
 * whole row shares, and the parts are pinned to them: that is what keeps the controls of one row
 * aligned when a description wraps or a message appears beside them.
 */
const PART_PLACEMENT = [
  '*:col-span-2 *:order-2',
  '*:data-[slot=field-label]:order-1',
  '*:data-[slot=field-message]:order-3 *:data-[slot=field-message]:col-span-1 *:data-[slot=field-message]:col-start-1',
  '*:data-[slot=field-counter]:order-3 *:data-[slot=field-counter]:col-span-1 *:data-[slot=field-counter]:col-start-2',

  /* A single checkbox has no label above: its message lines up with its own label, 24px in */
  'has-[>[data-slot=checkbox]]:*:data-[slot=field-message]:ps-6',

  'in-data-[slot=form-section]:row-span-3 in-data-[slot=form-section]:grid-rows-subgrid',
  'in-data-[slot=form-section]:*:row-start-2',
  'in-data-[slot=form-section]:*:data-[slot=field-label]:row-start-1',
  'in-data-[slot=form-section]:*:data-[slot=field-message]:row-start-3',
  'in-data-[slot=form-section]:*:data-[slot=field-counter]:row-start-3'
].join(' ');

/**
 * The line under the control, the same for a hint and for the message of every status: one size, one
 * line height, and a mark in a box as tall as that line. A hint that turns into an error moves
 * nothing, which is the whole point of writing it once.
 */
const MESSAGE = 'self-start text-xs leading-snug';

const MESSAGE_INK: Readonly<Record<FieldStatus | 'hint', string>> = {
  hint   : 'text-muted-foreground',
  error  : 'text-destructive',
  warning: 'text-warning-soft-foreground',
  success: 'text-success-soft-foreground'
};

const STATUS_GLYPH: Readonly<Record<FieldStatus, ToneGlyphTone>> = {
  error  : 'destructive',
  warning: 'warning',
  success: 'success'
};

/**
 * What takes the focus when an error summary points at the field: the element a control marks with
 * `data-field-control`, and otherwise the first thing that can be focused.
 */
const FIELD_CONTROL = '[data-field-control]';

const FOCUSABLE = [
  'input:not([type="hidden"]):not(:disabled)',
  'textarea:not(:disabled)',
  'select:not(:disabled)',
  'button:not(:disabled)',
  '[tabindex]:not([tabindex="-1"]):not(:disabled)'
].join(', ');


/* --------
 * Component Definition
 * -------- */

/**
 * What dresses a form control: its label, the asterisk, a description, a hint, a message, a counter.
 *
 * ```tsx
 * <Field label={'Street'} description={'As on the contract'} required span={4} error={errors.street}>
 *   <TextInput width={'long'} />
 * </Field>
 * ```
 *
 * Props only, and the control is the one child. On Base UI's `Field`, which owns what is easy to get
 * subtly wrong: the label tied to the control, the description and the message in its
 * `aria-describedby`, the ids. The label is the package's `Label`, its description under it and
 * above the control; under the control one line, the hint or, in its place and at the same height, the
 * message of a status.
 *
 * The state flows down only. A control learns from the field whether it is required, invalid,
 * disabled, and its status, through `useFieldControl`. `required` becomes `aria-required` and never the
 * native attribute: validation is the caller's, and the browser's bubble would be a second,
 * untranslated message.
 *
 * Slots: `field` (with `data-span`, `data-break-before`, `data-required`, `data-status`,
 * `data-orientation`, the one at `base`), `field-label` (a `Label`: `label-text`, `label-required`,
 * `label-optional`, `label-leading`, `label-description`), `field-message` (with `data-status`, its
 * text in `field-message-text` and its mark in `field-message-icon`), `field-counter` (with
 * `data-exceeded`).
 */
export const Field = React.forwardRef<HTMLDivElement, FieldProps>((props, ref) => {

  // ----
  // Props Deconstruct
  // ----
  const {
    breakBefore = false,
    children,
    className,
    counter,
    counterExceeded = false,
    description,
    disabled = false,
    error,
    errorSummary,
    hint,
    icon,
    id,
    label,
    message,
    optional,
    orientation = 'vertical',
    required = false,
    span = DEFAULT_SPAN,
    status: statusProp,
    ...others
  } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Internal Hooks
  // ----
  const generatedId = React.useId();
  const labelId = React.useId();
  const summaryId = React.useId();
  const fieldId = id ?? generatedId;
  const inSection = useFormSectionContext();
  const formErrors = useFormErrorRegistryContext();


  // ----
  // Internal State
  // ----
  const [ nativeLabel, setNativeLabel ] = React.useState(true);

  const rootRef = React.useRef<HTMLDivElement>(null);
  const handleRootRef = useForkRef(rootRef, ref);


  // ----
  // Derived State
  // ----
  const hasError = isPresent(error);
  const status: FieldStatus | undefined = hasError ? 'error' : statusProp;
  const statusMessage = hasError ? error : (status === undefined ? undefined : message);
  const invalid = status === 'error';
  const summaryText = isPresent(errorSummary) ? errorSummary : (isPresent(statusMessage) ? statusMessage : label);


  // ----
  // Memoized Data
  // ----
  const registry = React.useMemo<FieldRegistry>(() => ({
    setNativeLabel,
    fieldId,
    getElement  : () => rootRef.current,
    focusControl: () => {
      const root = rootRef.current;
      const control = root?.querySelector<HTMLElement>(FIELD_CONTROL) ?? root?.querySelector<HTMLElement>(FOCUSABLE);

      control?.focus();
    }
  }), [ fieldId ]);

  const controlState = React.useMemo<FieldControlState>(
    () => ({ required, invalid, disabled, status, labelId: isPresent(label) ? labelId : undefined }),
    [ required, invalid, disabled, status, label, labelId ]
  );


  // ----
  // Lifecycle Events
  // ----
  /* An error reaches the summary of the form around the field, with its long text */
  useEnhancedEffect(() => {
    if (!formErrors || !invalid) {
      return undefined;
    }

    return formErrors.register(summaryId, {
      summary     : summaryText,
      focusControl: registry.focusControl,
      getElement  : registry.getElement,
      fieldId
    });
  }, [ formErrors, invalid, summaryId, summaryText, registry, fieldId ]);


  // ----
  // Component Render
  // ----
  const lineKind: FieldStatus | 'hint' | undefined = isPresent(statusMessage) ? status : (isPresent(hint) ? 'hint' : undefined);

  /*
   * One element for the line, whatever it says: Base UI's error for an error, its description for the
   * rest, both rendered as the same row. `match` is `true` because the error came from the caller, not
   * from the browser's constraint validation: without it Base UI hides it until a ValidityState matches.
   */
  const lineProps = {
    'data-slot'  : 'field-message',
    'data-status': lineKind === 'hint' ? undefined : lineKind,
    render       : <Stack direction={'horizontal'} align={'start'} gap={1} />,
    className    : cn(MESSAGE, lineKind && MESSAGE_INK[lineKind])
  };

  const lineContent = lineKind !== undefined && (
    <React.Fragment>
      {lineKind !== 'hint' && <StatusGlyph tone={STATUS_GLYPH[lineKind]} slot={'field-message-icon'} />}
      <span data-slot={'field-message-text'} className={'min-w-0'}>{lineKind === 'hint' ? hint : statusMessage}</span>
    </React.Fragment>
  );

  return (
    <FieldPrimitive.Root
      {...rest}
      ref={handleRootRef}
      id={fieldId}
      data-slot={'field'}
      data-span={typeof span === 'object' ? (toResponsiveMap(span).base ?? DEFAULT_SPAN) : span}
      data-break-before={(typeof breakBefore === 'object' ? toResponsiveMap(breakBefore).base : breakBefore) || undefined}
      data-required={required || undefined}
      data-status={status}
      data-orientation={inSection ? 'vertical' : (typeof orientation === 'object' ? (orientation.base ?? 'vertical') : orientation)}
      invalid={invalid}
      disabled={disabled}
      className={cn(
        FIELD_GRID,
        PART_PLACEMENT,
        spanClasses(span),
        breakClasses(breakBefore),
        !inSection && orientationClasses(orientation),
        baseClasses,
        className
      )}
    >
      <FieldRegistryContext.Provider value={registry}>
        <FieldControlContext.Provider value={controlState}>
          <FieldLabelNativeContext.Provider value={nativeLabel}>
            {(isPresent(label) || isPresent(description)) && (
              /*
               * The `Label` of the package, its name on Base UI's label so it stays tied to the control
               * (a plain element in front of a list, which a click on a `<label>` would press), its
               * description on Base UI's description so the control is described by it
               */
              <Label
                data-slot={'field-label'}
                textAs={FieldPrimitive.Label}
                textProps={{ nativeLabel, render: nativeLabel ? undefined : <div /> }}
                textId={labelId}
                descriptionAs={FieldPrimitive.Description}
                description={description}
                leading={icon}
                required={required}
                optional={optional}
                className={'self-end'}
              >
                {label}
              </Label>
            )}

            {children}

            {lineKind === 'error' && (
              <FieldPrimitive.Error {...lineProps} match={true}>{lineContent}</FieldPrimitive.Error>
            )}

            {lineKind !== undefined && lineKind !== 'error' && (
              <FieldPrimitive.Description {...lineProps}>{lineContent}</FieldPrimitive.Description>
            )}

            {isPresent(counter) && (
              /* Visible only: a count read at every key is noise, so the announcement is the caller's */
              <span
                aria-hidden={'true'}
                data-slot={'field-counter'}
                data-exceeded={counterExceeded || undefined}
                className={cn(
                  'self-start justify-self-end text-xs leading-snug text-muted-foreground tabular-nums',
                  counterExceeded && 'text-destructive'
                )}
              >
                {counter}
              </span>
            )}
          </FieldLabelNativeContext.Provider>
        </FieldControlContext.Provider>
      </FieldRegistryContext.Provider>
    </FieldPrimitive.Root>
  );

});

Field.displayName = 'Field';
