import * as React from 'react';

import type { RequestError } from '@proedis/client';

import type { QueryErrorKind, SuspenseViewProps } from './suspense.types';


/* --------
 * Default Views
 * -------- */

/**
 * The built-in views exist so the boundary works with no configuration at all, and they are
 * deliberately the least opinionated thing that still says something to a user and to a screen
 * reader: one element each, no class, no copy, no dependency.
 *
 * They are not a design. Anything shipping to a real user replaces them through
 * `QuerySuspenseProvider` — which is exactly what that provider is for.
 */
const DefaultLoader: React.FunctionComponent = () => (
  <span aria-busy={'true'} role={'status'} />
);

DefaultLoader.displayName = 'QuerySuspenseDefaultLoader';


/**
 * The error view shows the error's own message and nothing else: any wording the package invented
 * would be in the wrong language for somebody.
 */
const DefaultErrorView: React.FunctionComponent<SuspenseViewProps<any, RequestError>> = ({ error }) => (
  <div role={'alert'}>{error?.message}</div>
);

DefaultErrorView.displayName = 'QuerySuspenseDefaultErrorView';


/* --------
 * Default Error Classification
 * -------- */

/**
 * A 404 is a missing entity, everything else is a failure.
 *
 * The package can afford this default — and the ancestor pattern always assumed it — because the
 * error type is the client's `RequestError`. It is still overridable: an endpoint that answers 200
 * with an empty envelope, or 403 for "you may not see this one", needs its own rule.
 */
export function classifyRequestError(error: RequestError): QueryErrorKind {
  return error?.statusCode === 404 ? 'notFound' : 'generic';
}


/* --------
 * Constants Definition
 * -------- */
export const DEFAULT_QUERY_SUSPENSE_CONFIG = {
  ErrorView    : DefaultErrorView,
  Loader       : DefaultLoader,
  classifyError: classifyRequestError,
  debugErrors  : false
} as const;
