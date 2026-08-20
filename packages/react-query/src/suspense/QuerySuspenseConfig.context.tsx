import * as React from 'react';

import type { RequestError } from '@proedis/client';
import { DEFAULT_QUERY_SUSPENSE_CONFIG } from './default-views';


import type {
  QueryErrorKind,
  QuerySuspenseTitleTools,
  SuspenseViewNode
} from './suspense.types';


/* --------
 * Config Definition
 * -------- */
export interface QuerySuspenseConfig<TError = RequestError> {
  /** Shown while the query has no data yet. Defaults to an empty `role="status"` element */
  Loader?: SuspenseViewNode<any, TError>;

  /** Shown when the query failed and the error is not a missing entity. Defaults to the message */
  ErrorView?: SuspenseViewNode<any, TError>;

  /** Shown when `classifyError` returns `'notFound'`. Falls back to `ErrorView` when unset */
  NotFound?: SuspenseViewNode<any, TError>;

  /** Shown when successful data is empty. Falls back to the content when unset */
  emptyContent?: SuspenseViewNode<any, TError>;

  /**
   * Wraps the `Header` and `Footer` slots, and the error view.
   *
   * The seam for the spacing a design system puts around the parts that sit beside the content —
   * historically a `Box` with a padding class. Without it those elements sit flush against the
   * panel edge.
   */
  AsideWrapper?: React.ComponentType<React.PropsWithChildren>;

  /** Map an error onto its kind. Defaults to `statusCode === 404` → `'notFound'` */
  classifyError?: (error: TError) => QueryErrorKind;

  /** Force every error through the error view. Drive it from your own development flag */
  debugErrors?: boolean;

  /**
   * Sink for the page title resolved from the query state.
   *
   * The package holds no opinion on where a title lives — this is the seam towards whatever owns
   * it in the host app (a shell context, `document.title`, a native header).
   */
  onTitleChange?: (title: string) => void;

  /** Titles used while pending or on error when the caller declared none */
  defaultTitles?: { error?: string, pending?: string };

  /** Values every page-title resolver receives on top of `data`. See `QuerySuspenseTitleTools` */
  titleTools?: QuerySuspenseTitleTools;
}


/**
 * The configuration as a boundary actually sees it: the two views that always have a default are
 * guaranteed present, so nothing downstream has to handle the case where they are missing.
 */
export type ResolvedQuerySuspenseConfig<TError = RequestError> =
  & Omit<QuerySuspenseConfig<TError>, 'ErrorView' | 'Loader'>
  & {
    ErrorView: SuspenseViewNode<any, TError>;
    Loader: SuspenseViewNode<any, TError>;
  };


/* --------
 * Context Definition
 * -------- */
const QuerySuspenseConfigContext = React.createContext<QuerySuspenseConfig<any> | undefined>(undefined);

QuerySuspenseConfigContext.displayName = 'QuerySuspenseConfigContext';


/* --------
 * Provider Definition
 * -------- */
export type QuerySuspenseProviderProps<TError = RequestError> = React.PropsWithChildren<{
  config: Partial<QuerySuspenseConfig<TError>>;
}>;


/**
 * Override the defaults used by every suspended component below it.
 *
 * **Optional.** A boundary with no provider above it works: it renders the built-in views, treats a
 * 404 as a missing entity, and pushes no page title. The provider exists to replace those with the
 * host app's own — which is the one thing a copy-pasted version of this pattern could never do
 * without being edited.
 *
 * Mount it once, next to the UI kit. Nested providers **merge** onto the enclosing one, and onto the
 * defaults, so a section can swap a single view — a table skeleton instead of the app spinner —
 * without redeclaring the rest.
 */
export function QuerySuspenseProvider<TError = RequestError>(props: QuerySuspenseProviderProps<TError>): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    children,
    config
  } = props;


  // ----
  // Internal Hooks
  // ----
  const parentConfig = React.useContext(QuerySuspenseConfigContext);


  // ----
  // Memoized Data
  // ----
  const mergedConfig = React.useMemo(
    () => ({ ...DEFAULT_QUERY_SUSPENSE_CONFIG, ...parentConfig, ...config } as QuerySuspenseConfig<TError>),
    [ config, parentConfig ]
  );


  // ----
  // Component Render
  // ----
  return (
    <QuerySuspenseConfigContext.Provider value={mergedConfig}>
      {children}
    </QuerySuspenseConfigContext.Provider>
  );

}


/* --------
 * Hook Definition
 * -------- */

/**
 * Read the effective suspense configuration: the defaults, with whatever the providers above
 * replaced.
 *
 * Never throws and never returns a hole — a missing provider is the supported case, not an error.
 */
export function useQuerySuspenseConfig<TError = RequestError>(): ResolvedQuerySuspenseConfig<TError> {
  const config = React.useContext(QuerySuspenseConfigContext);

  return React.useMemo(
    () => ({ ...DEFAULT_QUERY_SUSPENSE_CONFIG, ...config } as ResolvedQuerySuspenseConfig<TError>),
    [ config ]
  );
}
