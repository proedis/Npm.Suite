import * as React from 'react';

import type { AnyObject } from '@proedis/types';


/* --------
 * Internal Types
 * -------- */
type BuiltContext<C extends AnyObject> = [ React.Context<C | undefined>, () => C ];


/**
 * Easy creation of a React Context providing the name to use
 * and optionally an initial context.
 * Object returned will reformat string and return well-named function and components
 * @param name
 * @param initialContext
 */
export function contextBuilder<C extends AnyObject>(name: string, initialContext?: C): BuiltContext<C> {

  /** Create the base context using provided data */
  const BaseContext = React.createContext<C | undefined>(initialContext);

  /** Create the hook function to return */
  const useContextHook: () => C = () => {
    /** Get the context value using built in hook */
    const contextValue = React.useContext(BaseContext);
    /** Assert the context value exists */
    if (!contextValue) {
      throw new Error(`useContext() hook for ${name} must be invoked inside its right Context`);
    }
    /** Return extracted value */
    return contextValue;
  };

  /** Assign name to Context objects */
  BaseContext.displayName = name;

  return [ BaseContext, useContextHook ];
}


/**
 * The same pair for a context whose provider is **optional**: outside it the hook returns the default
 * value instead of throwing.
 *
 * ```tsx
 * const [ FieldContext, useFieldContext ] = optionalContextBuilder<FieldState>('Field', NO_FIELD);
 *
 * const field = useFieldContext();   // NO_FIELD outside a Field: the control works on its own
 * ```
 *
 * `contextBuilder` is right when a missing provider is a mistake. This one is for the other case, a
 * component that also works alone and only reads the context when something above provides it: a
 * control inside or outside a field, a dialog nested or not. The value may be anything, a primitive
 * included (`optionalContextBuilder('OverlayLevel', 0)`), which `contextBuilder` cannot take because
 * it tells a missing provider apart by a falsy value.
 *
 * @param name The name shown by React DevTools
 * @param defaultValue What the hook returns with no provider above
 */
export function optionalContextBuilder<C>(name: string, defaultValue: C): [ React.Context<C>, () => C ] {
  const BaseContext = React.createContext<C>(defaultValue);

  const useContextHook = (): C => React.useContext(BaseContext);

  BaseContext.displayName = name;

  return [ BaseContext, useContextHook ];
}
