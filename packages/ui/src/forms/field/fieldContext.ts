'use client';

import { optionalContextBuilder, useEnhancedEffect } from '@proedis/react';

import type * as React from 'react';


/* --------
 * Types Definition
 * -------- */

/**
 * The status of a field, and of the message under its control. `error` makes the control
 * `aria-invalid`; `warning` and `success` colour the frame and the message, and leave the value valid.
 */
export type FieldStatus = 'error' | 'warning' | 'success';

/** What a control needs to know about the field it sits in. It flows down only: the field decides it from its props */
export interface FieldControlState {
  /** The label carries the asterisk: the control says `aria-required`, never the native `required` */
  readonly required: boolean;

  /** The field shows an error: its status is `error` */
  readonly invalid: boolean;

  /** The whole field is disabled */
  readonly disabled: boolean;

  /** The status of the field, when it has one */
  readonly status?: FieldStatus;

  /** The id of the name of the field, for a control that composes its name from it */
  readonly labelId?: string;
}

/**
 * What a control tells the field around it, and what the form reaches the field by. Private to the
 * tier: a control calls `useNonNativeFieldLabel`, and only reads `useFieldControl`.
 */
export interface FieldRegistry {
  /**
   * A control that is not a text box (a trigger, a group of options) asks for a label that is not a
   * native `<label>`: a click on it must not press the trigger or pick the first option, and for a
   * group it is the legend that names the group.
   */
  readonly setNativeLabel: (native: boolean) => void;

  /** Moves the focus to the control of the field, for the links of an error summary */
  readonly focusControl: () => void;

  /** The root element, to order errors as they are on screen */
  readonly getElement: () => HTMLElement | null;

  /** The id of the root element, what a link of the error summary points at */
  readonly fieldId: string;
}

/** One error, as a form's summary lists it */
export interface FormErrorEntry {
  /** What the summary says for this field: the long text, with the name of the field in it */
  readonly summary: React.ReactNode;

  readonly focusControl: () => void;
  readonly getElement: () => HTMLElement | null;
  readonly fieldId: string;
}

/** How an error reaches the form around its field. Private to the two subpaths */
export interface FormErrorRegistry {
  readonly register: (id: string, entry: FormErrorEntry) => () => void;
}


/* --------
 * Context Definition
 * -------- */

const NO_FIELD: FieldControlState = { required: false, invalid: false, disabled: false };

export const [ FieldControlContext, useFieldControlContext ] = optionalContextBuilder<FieldControlState>('FieldControl', NO_FIELD);


export const [ FieldRegistryContext, useFieldRegistryContext ] = optionalContextBuilder<FieldRegistry | null>('FieldRegistry', null);


/**
 * Whether a field stands in a `Form.Section`, whose grid places its parts: there the field ignores
 * its own `orientation`. Provided by `Form`, like the error registry
 */
export const [ FormSectionContext, useFormSectionContext ] = optionalContextBuilder('FormSection', false);


/** Whether the label of a field renders a native `<label>`. Private: written by the controls through the registry */
export const [ FieldLabelNativeContext, useFieldLabelNativeContext ] = optionalContextBuilder('FieldLabelNative', true);


/**
 * Owned here and provided by `Form`: the dependency goes one way, from `form` to `field`, so the two
 * subpaths never import each other in a circle.
 */
export const [ FormErrorRegistryContext, useFormErrorRegistryContext ] = optionalContextBuilder<FormErrorRegistry | null>('FormErrorRegistry', null);


/**
 * The id a `Form` takes when it sits in a popover, a dialog or a drawer. They render their submit
 * button in their footer, outside the `<form>`, and point it at this id: nobody writes an id by hand
 * and two forms never end up nested. Owned here for the same reason as the registry above.
 */
export interface FormHost {
  readonly formId: string;
}

export const [ FormHostContext, useFormHostContext ] = optionalContextBuilder<FormHost | null>('FormHost', null);


/* --------
 * Hooks
 * -------- */

/*
 * A control registers with `useEnhancedEffect` from `@proedis/react`, a layout effect in the browser
 * and a plain one on the server: the label of a field around a list is never one frame a `<label>`.
 */

/**
 * The state of the field around a control: `required`, `invalid`, `disabled`.
 *
 * ```tsx
 * const { required, invalid } = useFieldControl();
 * return <input aria-required={required || undefined} aria-invalid={invalid || undefined} />;
 * ```
 *
 * Every control of this package reads it, and a control written by an application reads it the same
 * way: that is how the asterisk of the label and the announcement of the control cannot disagree.
 * Outside a field the three flags are `false` and there is no status.
 */
export function useFieldControl(): FieldControlState {
  return useFieldControlContext();
}


/**
 * Called by a control that is not a text box, for as long as it is mounted: the label of its field
 * becomes a plain element that names it, instead of a `<label>` that would press or pick on a click.
 * Private to the tier.
 */
export function useNonNativeFieldLabel(): void {

  // ----
  // Internal Hooks
  // ----
  const registry = useFieldRegistryContext();


  // ----
  // Lifecycle Events
  // ----
  useEnhancedEffect(() => {
    if (!registry) {
      return undefined;
    }

    registry.setNativeLabel(false);

    return () => registry.setNativeLabel(true);
  }, [ registry ]);

}
