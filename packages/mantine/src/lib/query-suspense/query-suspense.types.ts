import type * as React from 'react';

import type { ShorthandItem } from '@proedis/react';
import type { RequestError } from '@proedis/client';

import type {
  UseQueryResult,
  QueryObserverSuccessResult,
  QueryObserverLoadingErrorResult
} from '@tanstack/react-query';

import type { EmptyContentProps } from '../../components/EmptyContent';
import type { LoaderProps } from '../../components/Loader';


/* --------
 * Query Suspense Result
 * -------- */
interface SharedSuspendedContext {
  /** Smart data reload that could be used without any arguments  */
  reload: () => Promise<void>;

  /** Reset the query state when component will unmount */
  resetOnUnmount?: boolean;
}

export interface AnySuspendedContext<R> extends SharedSuspendedContext {
  /** The current query state */
  state: UseQueryResult<R, RequestError>;
}

export interface ErrorSuspendedContext<R> extends SharedSuspendedContext {
  /** The current query state */
  state: QueryObserverLoadingErrorResult<R, RequestError>;
}

export interface SuccessSuspendedContext<R> extends SharedSuspendedContext {
  /** The current query state */
  state: QueryObserverSuccessResult<R, RequestError>;
}

export type SuspendedComponentOutProps<R, P> = Omit<SuccessSuspendedContext<R> & P, 'state' | 'reload'>;

export type SuspendedWrapperProps<R, P extends {} = {}> = { children: React.ReactNode } & AnySuspendedContext<R> & P;


/* --------
 * Component Definitions
 * -------- */

/**
 * The query suspense HOC could be wrapped into any type
 * of external element.
 * The wrapper element will receive the current suspended context data
 */
export type SuspendedWrapper<R, P extends {} = {}> = React.FunctionComponent<SuspendedWrapperProps<R, P>>;


/**
 * The query suspense HOC could have a set of aside component depending on
 * the current query hook state.
 * The wrapper element will receive the current suspended context data
 */
export type SuspendedAsideComponent<R, P extends {} = {}> = React.FunctionComponent<AnySuspendedContext<R> & P>;


/**
 * A specific aside component that will render only once the query ends with an error.
 * The wrapper element will receive the current suspended context data
 */
export type ErrorSuspendedAsideComponent<P extends {} = {}> = React.FunctionComponent<ErrorSuspendedContext<any> & P>;


/**
 * The main suspended component rendered after the query has been completed with success.
 * The wrapper element will receive the current suspended context data
 */
export type SuspendedComponent<R, P extends {} = {}> = React.FunctionComponent<SuccessSuspendedContext<R> & P>;


/* --------
 * Suspended Props & Options
 * -------- */
export interface SuspendedSkeleton<R, P extends {} = {}> {
  /** Define the Wrapper the Component element only */
  ContentWrapper?: SuspendedWrapper<R, P>;

  /** Define the footer aside element */
  Footer?: SuspendedAsideComponent<R, P>;

  /** Define the header aside element */
  Header?: SuspendedAsideComponent<R, P>;

  /** Define a complete Wrapper that will encapsulate all the components */
  Wrapper?: SuspendedWrapper<R, P>;
}

export interface SuspendedComponentOptions<R, P extends {} = {}> extends SuspendedSkeleton<R, P> {
  /** Define an element to be shown if the request ends with a 404 result */
  NotFound?: ErrorSuspendedAsideComponent<P>;

  /**
   * If the result has been defined as an array of elements, the suspended component
   * could be set to avoid Component render if no data is present on the list
   */
  emptyContent?: R extends Array<any> ? ShorthandItem<EmptyContentProps> : never;

  /** Set loader props, or alternatively a new loader */
  loader?: ShorthandItem<LoaderProps>;
}


export interface QuerySuspenseProps<R, P extends {} = {}> extends SuspendedComponentOptions<R, P> {
  /** The component to render after the query has been completed with success */
  Component: SuspendedComponent<R, P>;

  /** Set the props to be passed to Component on rendering */
  innerProps: P;

  /** The query state */
  query: UseQueryResult<R, RequestError>;
}
