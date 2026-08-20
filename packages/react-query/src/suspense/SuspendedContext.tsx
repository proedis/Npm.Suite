import * as React from 'react';

import type { RequestError } from '@proedis/client';

import type {
  SuccessSuspendedContext,
  SuspendedComponent,
  SuspendedComponentRender
} from './suspense.types';


/* --------
 * Context Definition
 * -------- */
const SuspendedContext = React.createContext<SuccessSuspendedContext<any, any> | undefined>(undefined);

SuspendedContext.displayName = 'SuspendedContext';

export { SuspendedContext };


/* --------
 * Hook Definition
 * -------- */

/**
 * Read the resolved data from anywhere inside a suspended subtree, without threading it down.
 *
 * Returns data first because that is what a call site almost always wants: `const [ user ] =
 * useSuspendedContext<UserDto>()`. The context is there for the rarer need to reload or inspect
 * the query.
 *
 * @throws When called outside a suspended subtree. The data is guaranteed to exist inside one,
 *  which is what makes the non-nullable return type honest.
 */
export function useSuspendedContext<TData, TError = RequestError>()
  : [ TData, SuccessSuspendedContext<TData, TError> ] {
  const context = React.useContext<SuccessSuspendedContext<TData, TError> | undefined>(SuspendedContext);

  if (!context) {
    throw new Error('useSuspendedContext() must be called inside a suspended component or one of its children');
  }

  return [ context.state.data, context ];
}


/* --------
 * Helpers
 * -------- */

/**
 * Write a suspended component as a render function over data that is already there.
 *
 * ```tsx
 * const UserCard = suspendedComponent<UserDto, { compact?: boolean }>(
 *   (user, { compact }) => <Card title={user.name} compact={compact} />
 * );
 * ```
 *
 * @param render - Receives the data, the caller's own props, and the query context.
 */
export function suspendedComponent<TData, TProps extends {} = {}, TError = RequestError>(
  render: SuspendedComponentRender<TData, TProps, TError>
): SuspendedComponent<TData, TProps, TError> {
  return function Suspended(props) {
    const { reload, state, ...rest } = props;

    return render(state.data, rest as unknown as TProps, { reload, state });
  } as SuspendedComponent<TData, TProps, TError>;
}
