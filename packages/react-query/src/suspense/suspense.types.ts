import type * as React from 'react';

import type {
  UseQueryResult,
  QueryObserverSuccessResult,
  QueryObserverLoadingErrorResult
} from '@tanstack/react-query';

import type { RequestError } from '@proedis/client';


/* --------
 * Query View — the resolved state
 * -------- */

/**
 * Which of the mutually exclusive views a query resolves to.
 *
 * `notFound` and `empty` are deliberately distinct from `error` and `success`: "the entity does not
 * exist" and "the list has no rows" are the two states every real screen has to render differently
 * from a failure, and folding them into the other two is what makes call sites grow their own
 * conditionals again.
 */
export type QueryViewKind = 'pending' | 'error' | 'notFound' | 'empty' | 'success';


/** How an error was classified. Anything that is not a missing entity is generic. */
export type QueryErrorKind = 'notFound' | 'generic';


/** The minimal query shape the resolver needs — a plain object, so it is testable without React. */
export interface QueryStateLike<TData, TError = unknown> {
  data: TData | undefined;
  error: TError | null;
  status: 'pending' | 'error' | 'success';
}


export type QueryView<TData, TError = unknown> =
  | { kind: 'pending' }
  | { kind: 'error', error: TError }
  | { kind: 'notFound', error: TError }
  | { kind: 'empty', data: TData }
  | { kind: 'success', data: TData };


export interface ResolveQueryViewOptions<TData, TError = unknown> {
  /**
   * Map an error onto a kind. Return `'notFound'` for the "entity does not exist" case — with
   * `@proedis/client` that is `error.statusCode === 404`.
   *
   * Defaults to classifying every error as generic.
   */
  classifyError?: (error: TError) => QueryErrorKind;

  /**
   * When to consider successful data empty. `true` uses the built-in check — an array with no
   * elements. A predicate covers every other shape (a paginated envelope, a map, a string).
   *
   * Defaults to `false`: never empty, so a consumer that has not thought about the empty state
   * gets the success view rather than a silently blank screen. Declaring `emptyContent` flips it
   * to `true`, which is how the historical `emptyContent`-only call sites keep working.
   */
  isEmpty?: boolean | ((data: TData) => boolean);

  /**
   * Classify every error as generic, ignoring `classifyError`.
   *
   * The escape hatch for development: a "not found" view hides the response that produced it, and
   * during development the response is the interesting part. Drive it from your own env flag —
   * the package reads no bundler global.
   */
  debugErrors?: boolean;
}


/* --------
 * Suspended Context
 * -------- */
interface SharedSuspendedContext {
  /** Refetch the query. Never rejects: a failed reload surfaces through the query state. */
  reload: () => Promise<void>;
}

export interface AnySuspendedContext<TData, TError = RequestError> extends SharedSuspendedContext {
  state: UseQueryResult<TData, TError>;
}

export interface ErrorSuspendedContext<TData, TError = RequestError> extends SharedSuspendedContext {
  state: QueryObserverLoadingErrorResult<TData, TError>;
}

export interface SuccessSuspendedContext<TData, TError = RequestError> extends SharedSuspendedContext {
  state: QueryObserverSuccessResult<TData, TError>;
}


/* --------
 * View Slots
 * -------- */

/** What every state view receives. `error` is non-null only in the error and not-found states. */
export interface SuspenseViewProps<TData = any, TError = RequestError> extends SharedSuspendedContext {
  error: TError | null;
  state: UseQueryResult<TData, TError>;
}


/**
 * A view slot: an element, a component, or any renderable node.
 *
 * Accepting an element and not only a component is not sugar — it is how these slots have always
 * been filled: `emptyContent={<EmptyContent.EmptyThreadDefault />}`. A slot that demanded a
 * component would force every call site to wrap its element in an arrow function.
 */
export type SuspenseViewNode<TData = any, TError = RequestError> =
  | React.ReactNode
  | React.ComponentType<SuspenseViewProps<TData, TError>>;


/* --------
 * Component Contracts
 * -------- */

/** The main component, rendered only once the query has succeeded and its data is not empty. */
export type SuspendedComponent<TData, TProps extends {} = {}, TError = RequestError> =
  React.FunctionComponent<SuccessSuspendedContext<TData, TError> & TProps>;


/** An element rendered beside the content, in any query state. It receives the caller's props too. */
export type SuspendedAsideComponent<TData, TProps extends {} = {}, TError = RequestError> =
  React.FunctionComponent<AnySuspendedContext<TData, TError> & TProps>;


/** A wrapper receiving the current suspended context, the caller's props, and its children. */
export type SuspendedWrapper<TData, TProps extends {} = {}, TError = RequestError> =
  React.FunctionComponent<React.PropsWithChildren<AnySuspendedContext<TData, TError> & TProps>>;


/** The render function form of a suspended component, receiving data already unwrapped. */
export type SuspendedComponentRender<TData, TProps extends {} = {}, TError = RequestError> = (
  data: TData,
  props: TProps,
  query: SuccessSuspendedContext<TData, TError>
) => React.ReactNode;


/* --------
 * Skeleton
 * -------- */

/**
 * The frame drawn around the content in every state.
 *
 * It is what keeps a screen from jumping: the panel, its header and its footer render while the
 * query is still pending, and only the middle swaps between loader, error and content. Every slot
 * receives the caller's own props merged with `{ state, reload }`, which is what lets a wrapper
 * read the entity it is framing.
 */
export interface SuspendedSkeleton<TData, TProps extends {} = {}, TError = RequestError> {
  /** Wraps the content only, inside `Wrapper` and between `Header` and `Footer` */
  ContentWrapper?: SuspendedWrapper<TData, TProps, TError>;

  /** Rendered after the content, in every state */
  Footer?: SuspendedAsideComponent<TData, TProps, TError>;

  /** Rendered before the content, in every state */
  Header?: SuspendedAsideComponent<TData, TProps, TError>;

  /** Wraps everything — skeleton included */
  Wrapper?: SuspendedWrapper<TData, TProps, TError>;
}


/* --------
 * Page Title
 * -------- */

/**
 * Extra values handed to every page-title resolver, on top of `data`.
 *
 * Empty by design, and meant to be widened by the consuming app through declaration merging — the
 * same pattern `@proedis/react-client` uses for `ContextClientOverride`:
 *
 * ```ts
 * declare module '@proedis/react-query' {
 *   interface QuerySuspenseTitleTools {
 *     t: TranslationFunction;
 *   }
 * }
 * ```
 *
 * It exists because a title resolver is declared in a module-scope options object, outside React,
 * so it cannot call a hook to translate itself. The provider — which *is* inside React — puts the
 * tools in the config once.
 */

export interface QuerySuspenseTitleTools {}


export type PageTitleResolver<TData> = string | ((context: { data: TData } & QuerySuspenseTitleTools) => string);


export interface QuerySuspensePageTitle<TData> {
  /** Title while the query is failing */
  error?: PageTitleResolver<null>;

  /** Title while the query has no data yet */
  pending?: PageTitleResolver<null>;

  /** Title once the data is there — the only one that can name the entity */
  success?: PageTitleResolver<TData>;
}
