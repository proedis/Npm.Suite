import * as React from 'react';

import { getValueAt, setValueAt } from '@proedis/utils';
import type { SetValueUpdater } from '@proedis/utils';

import type { AnyObject, ObjectPath, ValueAtPath } from '@proedis/types';

import { useSafeState } from './useSafeState';
import { useSyncedRef } from './useSyncedRef';


/* --------
 * Internal types
 * -------- */
interface UseObjectStateOptions<Values extends AnyObject> {
  /** Call every time the state change */
  onChange?: (values: Values) => void;
}

interface UseObjectStateMethods<Values extends AnyObject> {
  /** Get a value using key path */
  getValue: <Path extends ObjectPath<Values>>(path: Path) => ValueAtPath<Values, Path>;

  /** Set a value using key path */
  setValue: <Path extends ObjectPath<Values>>(path: Path, value: SetValueUpdater<Values, Path>) => void;

  /** Instantly update the entire object with a new one */
  transact: (state: Values | ((current: Values) => Values)) => void;
}


/**
 * Hook that could be used to manage an immutable object, updating or returning value
 * using key dotted path.
 *
 * @param initialObject
 * @param options
 */
export function useObjectState<Values extends AnyObject>(
  initialObject: Values | (() => Values),
  options?: UseObjectStateOptions<Values>
): readonly [ Values, UseObjectStateMethods<Values> ] {

  /** Create the initial state using provided object */
  const [ state, setState ] = useSafeState(initialObject);

  /** Call the onChange function every time state changes */
  const onStateChangeRef = useSyncedRef(options?.onChange);
  React.useEffect(
    () => {
      const { current: currentOnChange } = onStateChangeRef;

      if (typeof currentOnChange === 'function') {
        currentOnChange(state);
      }
    },
    [ onStateChangeRef, state ]
  );

  /** Create the utilities to instantly transact the state */
  const transact = React.useCallback<UseObjectStateMethods<Values>['transact']>(
    (nextState) => {
      if (typeof nextState === 'function') {
        setState((curr) => ({
          ...nextState(curr)
        }));
      }
      else {
        setState({ ...nextState });
      }
    },
    [ setState ]
  );

  /** Create the utility to get the value at specific path */
  const getValue = React.useCallback(
    <Path extends ObjectPath<Values>>(path: Path) => (
      getValueAt(state, path)
    ),
    [ state ]
  );

  /** Set value at specific path */
  const setValue = React.useCallback(
    <Path extends ObjectPath<Values>>(path: Path, value: SetValueUpdater<Values, Path>) => {
      setState((curr) => (
        setValueAt(curr, path, value, { immutable: true })
      ));
    },
    [ setState ]
  );

  /** Hook returns */
  return [ state, { getValue, setValue, transact } ];

}
