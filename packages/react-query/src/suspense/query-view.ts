import type {
  QueryErrorKind,
  QueryStateLike,
  QueryView,
  ResolveQueryViewOptions
} from './suspense.types';


/* --------
 * Helpers
 * -------- */
function isEmptyData<TData>(data: TData, isEmpty: ResolveQueryViewOptions<TData>['isEmpty']): boolean {
  if (typeof isEmpty === 'function') {
    return isEmpty(data);
  }

  /** The built-in check covers the common case and nothing else: an array with no elements */
  return isEmpty === true && Array.isArray(data) && !data.length;
}


/* --------
 * API
 * -------- */

/**
 * Turn a query state into the single view that should be rendered.
 *
 * This is the invariant of the whole suspense layer, and the reason it is a plain function: the
 * decision "loader, error, not-found, empty or content" never changed across the years and the
 * UI kits, while everything painting those five states did. Keeping it separate means it can be
 * unit tested on literals, and reused by anything that is not a React component — a route loader,
 * a native screen.
 *
 * @param state - Anything shaped like a query result. A `UseQueryResult` satisfies it.
 * @param options - See `ResolveQueryViewOptions`.
 */
export function resolveQueryView<TData, TError = unknown>(
  state: QueryStateLike<TData, TError>,
  options?: ResolveQueryViewOptions<TData, TError>
): QueryView<TData, TError> {

  // ----
  // Options Deconstruct
  // ----
  const {
    classifyError,
    debugErrors = false,
    isEmpty = false
  } = options ?? {};


  // ----
  // Pending
  // ----
  if (state.status === 'pending') {
    return { kind: 'pending' };
  }


  // ----
  // Error, possibly a missing entity
  // ----
  if (state.status === 'error') {
    const error = state.error as TError;

    const errorKind: QueryErrorKind = (!debugErrors && classifyError)
      ? classifyError(error)
      : 'generic';

    return errorKind === 'notFound'
      ? { kind: 'notFound', error }
      : { kind: 'error', error };
  }


  // ----
  // Success — empty or not
  // ----
  const data = state.data as TData;

  return isEmptyData(data, isEmpty)
    ? { kind: 'empty', data }
    : { kind: 'success', data };

}
