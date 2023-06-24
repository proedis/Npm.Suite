import * as React from 'react';

import type { AnyObject } from '@proedis/types';


/* --------
 * Internal Types
 * -------- */
type KeyValue<Key extends string, Value> = {
  [key in Key]: Value
};

type Context<N extends string, C extends AnyObject> = KeyValue<`${Capitalize<N>}Context`, React.Context<C>>;
type ContextHook<N extends string, C extends AnyObject> = KeyValue<`use${Capitalize<N>}`, () => C>;
type ContextProvider<N extends string, C extends AnyObject> = KeyValue<`${Capitalize<N>}Provider`, React.Provider<C>>;
type ContextConsumer<N extends string, C extends AnyObject> = KeyValue<`${Capitalize<N>}Consumer`, React.Consumer<C>>;

type BuiltContext<Name extends string, ContextValue extends AnyObject> =
  & Context<Name, ContextValue>
  & ContextHook<Name, ContextValue>
  & ContextProvider<Name, ContextValue>
  & ContextConsumer<Name, ContextValue>;


/**
 * Easy creation of a React Context providing the name to use
 * and optionally an initial context.
 * Object returned will reformat string and return well-named function and components
 * @param name
 * @param initialContext
 */
export function contextBuilder<ContextValue extends AnyObject, Name extends string = string>(
  name: Name,
  initialContext?: ContextValue
): BuiltContext<Name, ContextValue> {

  /** Create the base context using provided data */
  const BaseContext = React.createContext<ContextValue | undefined>(initialContext);

  /** Create the capitalized name */
  const capitalizedName = `${name.charAt(0).toUpperCase()}${name.slice(1)}` as Capitalize<Name>;

  /** Create the hook function to return */
  const useContextHook: () => ContextValue = () => {
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
  const context = { [`${capitalizedName}Context`]: BaseContext } as Context<Name, ContextValue>;
  const contextHook = { [`use${capitalizedName}`]: useContextHook } as ContextHook<Name, ContextValue>;
  const contextProvider = { [`${capitalizedName}Provider`]: BaseContext.Provider } as ContextProvider<Name, ContextValue>;
  const contextConsumer = { [`${capitalizedName}Consumer`]: BaseContext.Consumer } as ContextConsumer<Name, ContextValue>;

  return {
    ...context,
    ...contextHook,
    ...contextProvider,
    ...contextConsumer
  };
}
