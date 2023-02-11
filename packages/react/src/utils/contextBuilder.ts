import * as React from 'react';

import type { AnyObject } from '@proedis/types';


/* --------
 * Internal Types
 * -------- */
type KeyValue<Key extends string, Value> = {
  [key in Key]: Value
};

type ContextHook<N extends string, C extends AnyObject> = KeyValue<`use${Capitalize<N>}`, () => C>;
type ContextProvider<N extends string, C extends AnyObject> = KeyValue<`${Capitalize<N>}Provider`, React.Provider<C>>;
type ContextConsumer<N extends string, C extends AnyObject> = KeyValue<`${Capitalize<N>}Consumer`, React.Consumer<C>>;

type BuiltContext<Name extends string, Context extends AnyObject> =
  & ContextHook<Name, Context>
  & ContextProvider<Name, Context>
  & ContextConsumer<Name, Context>;


/**
 * Easy creation of a React Context providing the name to use
 * and optionally an initial context.
 * Object returned will reformat string and return well-named function and components
 * @param name
 * @param initialContext
 */
export function contextBuilder<Context extends AnyObject, Name extends string = string>(
  name: Name,
  initialContext?: Context
): BuiltContext<Name, Context> {

  /** Create the base context using provided data */
  const BaseContext = React.createContext<Context | undefined>(initialContext);

  /** Create the capitalized name */
  const capitalizedName = `${name.charAt(0).toUpperCase()}${name.slice(1)}` as Capitalize<Name>;

  /** Create the hook function to return */
  const useContextHook: () => Context = () => {
    /** Get the context value using built in hook */
    const contextValue = React.useContext(BaseContext);
    /** Assert the context value exists */
    if (!contextValue) {
      throw new Error(`use${capitalizedName}() hook must be invoked inside its right Context`);
    }
    /** Return extracted value */
    return contextValue;
  };

  /** Assign name to Context objects */
  BaseContext.displayName = capitalizedName;

  /** Return context tools */
  const contextHook = { [`use${capitalizedName}`]: useContextHook } as ContextHook<Name, Context>;
  const contextProvider = { [`${capitalizedName}Provider`]: BaseContext.Provider } as ContextProvider<Name, Context>;
  const contextConsumer = { [`${capitalizedName}Consumer`]: BaseContext.Consumer } as ContextConsumer<Name, Context>;

  return {
    ...contextHook,
    ...contextProvider,
    ...contextConsumer
  };
}
