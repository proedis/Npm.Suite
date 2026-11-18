'use client';

import * as React from 'react';


/* --------
 * Types Definition
 * -------- */

/** What a control needs to know about the field it sits in */
export interface FieldControlState {
  /** The label carries the asterisk: the control says `aria-required`, never the native `required` */
  readonly required: boolean;

  /** The field shows an error */
  readonly invalid: boolean;

  /** The whole field is disabled */
  readonly disabled: boolean;

  /** The id of `Field.Label`, for a control that composes its name from it */
  readonly labelId?: string;
}

/**
 * How the parts of a field tell the field what they are. Private: a part registers itself, a control
 * only reads `useFieldControl`.
 */
export interface FieldRegistry {
  readonly setRequired: (required: boolean) => void;
  readonly setInvalid: (invalid: boolean) => void;

  /**
   * A control that is not a text box (a trigger, a group of options) asks for a label that is not a
   * native `<label>`: a click on it must not press the trigger or pick the first option, and for a
   * group it is the legend that names the group.
   */
  readonly setNativeLabel: (native: boolean) => void;

  readonly setLabelId: (id: string | undefined) => void;

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

export const FieldControlContext = React.createContext<FieldControlState>(NO_FIELD);

FieldControlContext.displayName = 'FieldControlContext';

export const FieldRegistryContext = React.createContext<FieldRegistry | null>(null);

FieldRegistryContext.displayName = 'FieldRegistryContext';

/** Whether `Field.Label` renders a native `<label>`. Private: written by the controls through the registry */
export const FieldLabelNativeContext = React.createContext(true);

FieldLabelNativeContext.displayName = 'FieldLabelNativeContext';

/**
 * Owned here and provided by `Form`: the dependency goes one way, from `form` to `field`, so the two
 * subpaths never import each other in a circle.
 */
export const FormErrorRegistryContext = React.createContext<FormErrorRegistry | null>(null);

FormErrorRegistryContext.displayName = 'FormErrorRegistryContext';

/**
 * The id a `Form` takes when it sits in a popover, a dialog or a drawer. They render their submit
 * button in their footer, outside the `<form>`, and point it at this id: nobody writes an id by hand
 * and two forms never end up nested. Owned here for the same reason as the registry above.
 */
export interface FormHost {
  readonly formId: string;
}

export const FormHostContext = React.createContext<FormHost | null>(null);

FormHostContext.displayName = 'FormHostContext';


/* --------
 * Hooks
 * -------- */

/**
 * A layout effect in the browser, nothing on the server.
 *
 * A part registers itself before paint, so a required field never shows one frame without its
 * `aria-required` and an invalid one never one frame with its description.
 */
export const useIsomorphicLayoutEffect = typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;


/**
 * The state of the field around a control: `required`, `invalid`, `disabled`.
 *
 * ```tsx
 * const { required, invalid } = useFieldControl();
 * return <input aria-required={required || undefined} aria-invalid={invalid || undefined} />;
 * ```
 *
 * Every control of this package reads it, and a control written by an application reads it the same
 * way: that is how the asterisk of `Field.Label` and the announcement of the control cannot
 * disagree. Outside a field all three are `false`.
 */
export function useFieldControl(): FieldControlState {
  return React.useContext(FieldControlContext);
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
  const registry = React.useContext(FieldRegistryContext);


  // ----
  // Lifecycle Events
  // ----
  useIsomorphicLayoutEffect(() => {
    if (!registry) {
      return undefined;
    }

    registry.setNativeLabel(false);

    return () => registry.setNativeLabel(true);
  }, [ registry ]);

}
