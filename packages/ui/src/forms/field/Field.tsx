'use client';

import * as React from 'react';

import { Field as FieldPrimitive } from '@base-ui/react/field';

import { useEnhancedEffect, useForkRef } from '@proedis/react';

import { splitBaseProps } from '../../core/base';
import { cn } from '../../core/cn';
import { responsiveClasses, toResponsiveMap } from '../../core/responsive';

import { Stack } from '../../layout/Stack';

import { Label } from '../../primitives/Label';

import { ErrorGlyph } from '../../internal/glyphs';
import { isPresent } from '../../internal/presence';


import {
  FieldControlContext,
  FieldLabelNativeContext,
  FieldRegistryContext,
  useFieldControl,
  useFieldLabelNativeContext,
  useFieldRegistryContext,
  useFormErrorRegistryContext,
  useFormSectionContext
} from './fieldContext';

import type { BaseProps } from '../../core/base';
import type { Direction, Responsive } from '../../core/responsive';

import type { FieldControlState, FieldRegistry } from './fieldContext';


/* --------
 * Types Definition
 * -------- */

/** Columns a field takes in a form section of six */
export type FieldSpan = 1 | 2 | 3 | 4 | 6;

export interface StrictFieldProps extends BaseProps {
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
   * `horizontal` puts the label beside the control, a third of the width, and the messages under the
   * control: `{ base: 'vertical', md: 'horizontal' }` keeps it above on a phone. Defaults to `vertical`.
   * Ignored in a `Form.Section`, whose grid aligns the labels of a row
   */
  orientation?: Responsive<Direction>;

  /** Disables the control inside */
  disabled?: boolean;

  /** The name the control is submitted under */
  name?: string;

  /** The parts and the control, in any order: each one finds its own row */
  children?: React.ReactNode;
}

export type FieldProps = StrictFieldProps & Omit<
  React.ComponentProps<'div'>,
  keyof StrictFieldProps | 'color' | 'defaultChecked' | 'defaultValue'
>;

export interface StrictFieldLabelProps extends BaseProps {
  /** Shows the asterisk and makes the control `aria-required`. Validation stays with the caller */
  required?: boolean;

  /**
   * The word after the name of a field that may stay empty, in the language of the page: "optional".
   * The convention of a form where almost everything is required. Not shown with `required`
   */
  optional?: React.ReactNode;
}

export type FieldLabelProps = StrictFieldLabelProps & Omit<React.ComponentProps<'label'>, keyof StrictFieldLabelProps | 'color'>;

export type StrictFieldDescriptionProps = BaseProps;

export type FieldDescriptionProps = StrictFieldDescriptionProps & Omit<React.ComponentProps<'p'>, keyof StrictFieldDescriptionProps | 'color'>;

export interface StrictFieldErrorProps extends BaseProps {
  /**
   * What the summary of the form says for this field, when it differs from the message: the message
   * under a short field is one or two words ("5 digits"), the summary line names the field ("ZIP
   * code: it must have 5 digits"). Defaults to the message.
   */
  summary?: React.ReactNode;
}

export type FieldErrorProps = StrictFieldErrorProps & Omit<React.ComponentProps<'div'>, keyof StrictFieldErrorProps | 'color'>;

export interface StrictFieldCounterProps extends BaseProps {
  /** The count is past the limit: it turns to the colour of an error */
  exceeded?: boolean;
}

export type FieldCounterProps = StrictFieldCounterProps & Omit<React.ComponentProps<'span'>, keyof StrictFieldCounterProps | 'color'>;


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
 * to it. Each class, with every breakpoint prefix, is declared in `theme.css`.
 */
/* eslint-disable no-restricted-syntax -- grid placement of the parts: named tracks, gap-x apart, declared in theme.css */
const ORIENTATION_LAYOUT: Readonly<Record<Direction, string>> = {
  horizontal: [
    'grid-cols-field-horizontal gap-x-4',
    '*:col-start-2 *:col-span-2 *:row-start-1',
    '*:data-[slot=field-label]:col-start-1 *:data-[slot=field-label]:col-span-1 *:data-[slot=field-label]:row-start-1',
    '*:data-[slot=field-label]:flex *:data-[slot=field-label]:min-h-control-md *:data-[slot=field-label]:items-center *:data-[slot=field-label]:self-start',
    '*:data-[slot=field-description]:col-start-2 *:data-[slot=field-description]:row-start-2',
    '*:data-[slot=field-error]:col-start-2 *:data-[slot=field-error]:row-start-2',
    '*:data-[slot=field-counter]:col-start-3 *:data-[slot=field-counter]:row-start-2'
  ].join(' '),
  vertical: [
    'grid-cols-field gap-x-2',
    '*:col-start-auto *:col-span-2 *:row-start-auto',
    '*:data-[slot=field-label]:col-start-auto *:data-[slot=field-label]:col-span-2 *:data-[slot=field-label]:row-start-auto',
    '*:data-[slot=field-label]:block *:data-[slot=field-label]:min-h-0 *:data-[slot=field-label]:self-end',
    '*:data-[slot=field-description]:col-start-1 *:data-[slot=field-description]:row-start-auto',
    '*:data-[slot=field-error]:col-start-1 *:data-[slot=field-error]:row-start-auto',
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
 * Where each part goes, by its slot and not by the order it was written in.
 *
 * Two columns, the message and the counter at its end; the label and the control take both. Three
 * rows: label, control, messages. Alone, the rows come from `order`, so a field with no label has no
 * empty row on top. In a section the field is a subgrid over three tracks the whole row shares, and
 * the parts are pinned to them: that is what keeps the controls of one row aligned when a label wraps
 * or an error appears beside them.
 */
const PART_PLACEMENT = [
  '*:col-span-2 *:order-2',
  '*:data-[slot=field-label]:order-1',
  '*:data-[slot=field-description]:order-3 *:data-[slot=field-description]:col-span-1 *:data-[slot=field-description]:col-start-1',
  '*:data-[slot=field-error]:order-3 *:data-[slot=field-error]:col-span-1 *:data-[slot=field-error]:col-start-1',
  '*:data-[slot=field-counter]:order-3 *:data-[slot=field-counter]:col-span-1 *:data-[slot=field-counter]:col-start-2',

  /* A single checkbox has no label above: its messages line up with its own label, 24px in */
  'has-[>[data-slot=checkbox]]:*:data-[slot=field-description]:ps-6 has-[>[data-slot=checkbox]]:*:data-[slot=field-error]:ps-6',

  'in-data-[slot=form-section]:row-span-3 in-data-[slot=form-section]:grid-rows-subgrid',
  'in-data-[slot=form-section]:*:row-start-2',
  'in-data-[slot=form-section]:*:data-[slot=field-label]:row-start-1',
  'in-data-[slot=form-section]:*:data-[slot=field-description]:row-start-3',
  'in-data-[slot=form-section]:*:data-[slot=field-error]:row-start-3',
  'in-data-[slot=form-section]:*:data-[slot=field-counter]:row-start-3'
].join(' ');

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
 * Parts
 * -------- */

/**
 * The visible name of the control, tied to it. A noun, with no trailing colon.
 *
 * `required` puts the asterisk after the text, hidden from assistive technology, and makes the
 * control `aria-required` through the field: the two can never disagree.
 */
function FieldLabel(props: FieldLabelProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { children, className, id, optional, required = false, ...others } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Internal Hooks
  // ----
  const registry = useFieldRegistryContext();
  const native = useFieldLabelNativeContext();
  const generatedId = React.useId();
  const labelId = id ?? generatedId;


  // ----
  // Lifecycle Events
  // ----
  useEnhancedEffect(() => {
    if (!registry || !required) {
      return undefined;
    }

    registry.setRequired(true);

    return () => registry.setRequired(false);
  }, [ registry, required ]);

  useEnhancedEffect(() => {
    if (!registry) {
      return undefined;
    }

    registry.setLabelId(labelId);

    return () => registry.setLabelId(undefined);
  }, [ registry, labelId ]);


  // ----
  // Component Render
  // ----
  /*
   * The `Label` of the package, on Base UI's label so the name stays tied to the control. Its slot is
   * `field-label` still: the grid of the field places its parts by slot
   */
  return (
    <Label
      as={FieldPrimitive.Label}
      {...rest}
      id={labelId}
      nativeLabel={native}
      render={native ? undefined : <div />}
      data-slot={'field-label'}
      required={required}
      optional={optional}
      className={cn('self-end', baseClasses, className)}
    >
      {children}
    </Label>
  );

}

FieldLabel.displayName = 'Field.Label';


/**
 * What is worth knowing before typing: a format, a constraint, what the value is for.
 *
 * Not rendered while the field shows an error, which takes its place: the error repeats what the
 * description said. Not hidden but absent, so it also leaves the `aria-describedby` of the control.
 */
function FieldDescription(props: FieldDescriptionProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { className, ...others } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Internal Hooks
  // ----
  const { invalid } = useFieldControl();


  // ----
  // Component Render
  // ----
  if (invalid) {
    return null;
  }

  return (
    <FieldPrimitive.Description
      {...rest}
      data-slot={'field-description'}
      className={cn('self-start text-sm text-muted-foreground', baseClasses, className)}
    />
  );

}

FieldDescription.displayName = 'Field.Description';


/**
 * The error, from the caller: a schema, a server answer. With content the field is invalid; empty
 * (`null`, `undefined`, `false`, `''`) it renders nothing and the field is valid again.
 *
 * Inside a `Form` it also reaches the form's error summary, with its `summary` text.
 */
function FieldError(props: FieldErrorProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { children, className, summary, ...others } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Internal Hooks
  // ----
  const registry = useFieldRegistryContext();
  const formErrors = useFormErrorRegistryContext();
  const id = React.useId();


  // ----
  // Lifecycle Events
  // ----
  const present = isPresent(children);
  const summaryText = isPresent(summary) ? summary : children;

  useEnhancedEffect(() => {
    if (!registry || !present) {
      return undefined;
    }

    registry.setInvalid(true);

    return () => registry.setInvalid(false);
  }, [ registry, present ]);

  useEnhancedEffect(() => {
    if (!formErrors || !registry || !present) {
      return undefined;
    }

    return formErrors.register(id, {
      summary     : summaryText,
      focusControl: registry.focusControl,
      getElement  : registry.getElement,
      fieldId     : registry.fieldId
    });
  }, [ formErrors, registry, present, id, summaryText ]);


  // ----
  // Component Render
  // ----
  if (!present) {
    return null;
  }

  return (
    /*
     * `match` is `true` because the message came from the caller, not from the browser's constraint
     * validation: without it Base UI hides the error until a ValidityState key matches.
     */
    <FieldPrimitive.Error
      {...rest}
      match={true}
      data-slot={'field-error'}
      render={<Stack direction={'horizontal'} align={'start'} gap={1} />}
      className={cn('self-start text-sm text-destructive', baseClasses, className)}
    >
      <ErrorGlyph />
      <span data-slot={'field-error-message'} className={'min-w-0'}>{children}</span>
    </FieldPrimitive.Error>
  );

}

FieldError.displayName = 'Field.Error';


/**
 * A count at the end of the message row, there with or without a description or an error.
 *
 * Visible only, hidden from assistive technology: a count read at every key is noise, so the
 * announcement is the caller's, near the limit and past it.
 */
function FieldCounter(props: FieldCounterProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { className, exceeded = false, ...others } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Component Render
  // ----
  return (
    <span
      aria-hidden={'true'}
      {...rest}
      data-slot={'field-counter'}
      data-exceeded={exceeded || undefined}
      className={cn(
        'self-start justify-self-end text-sm text-muted-foreground tabular-nums',
        exceeded && 'text-destructive',
        baseClasses,
        className
      )}
    />
  );

}

FieldCounter.displayName = 'Field.Counter';


/* --------
 * Component Definition
 * -------- */

/**
 * What dresses a form control: its label, the asterisk, a description, an error, a counter.
 *
 * ```tsx
 * <Field span={4} breakBefore>
 *   <Field.Label required>Street</Field.Label>
 *   <TextInput width={'long'} />
 *   <Field.Description>As on the contract</Field.Description>
 *   <Field.Error summary={'Street: write it in full'}>{errors.street}</Field.Error>
 * </Field>
 * ```
 *
 * Parts only, no shortcut props, and the control is a direct child. On Base UI's `Field`, which owns
 * what is easy to get subtly wrong: the label tied to the control, the description and the error in
 * its `aria-describedby`, the ids.
 *
 * A control learns from the field whether it is required, invalid or disabled through
 * `useFieldControl`. `required` becomes `aria-required` and never the native attribute: validation is
 * the caller's, and the browser's bubble would be a second, untranslated message.
 *
 * Slots: `field` (with `data-span`, `data-break-before`, `data-required`), `field-label`,
 * `label-required`, `label-optional`, `field-description`, `field-error`, `field-error-icon-box`,
 * `field-error-icon`, `field-error-message`, `field-counter`. The root also has `data-orientation`, the one at `base`.
 */
const FieldRoot = React.forwardRef<HTMLDivElement, FieldProps>((props, ref) => {

  // ----
  // Props Deconstruct
  // ----
  const {
    breakBefore = false,
    children,
    className,
    disabled = false,
    id,
    orientation = 'vertical',
    span = DEFAULT_SPAN,
    ...others
  } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Internal Hooks
  // ----
  const generatedId = React.useId();
  const fieldId = id ?? generatedId;
  const inSection = useFormSectionContext();


  // ----
  // Internal State
  // ----
  const [ required, setRequired ] = React.useState(false);
  const [ invalid, setInvalid ] = React.useState(false);
  const [ nativeLabel, setNativeLabel ] = React.useState(true);
  const [ labelId, setLabelId ] = React.useState<string | undefined>(undefined);

  const rootRef = React.useRef<HTMLDivElement>(null);
  const handleRootRef = useForkRef(rootRef, ref);


  // ----
  // Memoized Data
  // ----
  const registry = React.useMemo<FieldRegistry>(() => ({
    setRequired,
    setInvalid,
    setNativeLabel,
    setLabelId,
    fieldId,
    getElement  : () => rootRef.current,
    focusControl: () => {
      const root = rootRef.current;
      const control = root?.querySelector<HTMLElement>(FIELD_CONTROL) ?? root?.querySelector<HTMLElement>(FOCUSABLE);

      control?.focus();
    }
  }), [ fieldId ]);

  const controlState = React.useMemo<FieldControlState>(
    () => ({ required, invalid, disabled, labelId }),
    [ required, invalid, disabled, labelId ]
  );


  // ----
  // Component Render
  // ----
  return (
    <FieldPrimitive.Root
      {...rest}
      ref={handleRootRef}
      id={fieldId}
      data-slot={'field'}
      data-span={typeof span === 'object' ? (toResponsiveMap(span).base ?? DEFAULT_SPAN) : span}
      data-break-before={(typeof breakBefore === 'object' ? toResponsiveMap(breakBefore).base : breakBefore) || undefined}
      data-required={required || undefined}
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
            {children}
          </FieldLabelNativeContext.Provider>
        </FieldControlContext.Provider>
      </FieldRegistryContext.Provider>
    </FieldPrimitive.Root>
  );

});

FieldRoot.displayName = 'Field';

export const Field = Object.assign(FieldRoot, {
  Label      : FieldLabel,
  Description: FieldDescription,
  Error      : FieldError,
  Counter    : FieldCounter
});
