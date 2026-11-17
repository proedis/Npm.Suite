'use client';

import * as React from 'react';


/* --------
 * Context Definition
 * -------- */

/**
 * Whether the field around a control is required, handed down by `Field`.
 *
 * It travels through a context rather than a prop because the control is the caller's child: a
 * `Field` cannot set a prop on it, and asking the caller to repeat `required` on both is how the
 * asterisk and the announcement end up disagreeing.
 *
 * ⚠️ The control turns it into `aria-required`, never into the native `required`. The native
 * attribute switches on the browser's own validation bubble, and in a form validated by a schema
 * that is a second, unstyled, untranslated error message on top of the real one.
 *
 * Private to the tier: the barrel does not export it.
 */
const FieldRequiredContext = React.createContext(false);

FieldRequiredContext.displayName = 'FieldRequiredContext';


/* --------
 * Exports
 * -------- */

export const FieldRequiredProvider = FieldRequiredContext.Provider;


/** Whether the nearest `Field` is required. `false` outside a field */
export function useFieldRequired(): boolean {
  return React.useContext(FieldRequiredContext);
}
