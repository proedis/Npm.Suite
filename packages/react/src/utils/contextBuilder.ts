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
