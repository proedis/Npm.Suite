import * as React from 'react';

import type { UseQueryResult } from '@tanstack/react-query';

import type { RequestError } from '@proedis/client';
import { renderViewNode } from './render-view';
import { resolveQueryView } from './query-view';
import { SuspendedContext } from './SuspendedContext';
import { useQuerySuspenseConfig } from './QuerySuspenseConfig.context';


import type {
  AnySuspendedContext,
  QueryErrorKind,
  ResolveQueryViewOptions,
  SuccessSuspendedContext,
  SuspendedComponent,
  SuspendedSkeleton,
  SuspendedWrapper,
  SuspenseViewNode,
  SuspenseViewProps
} from './suspense.types';


/* --------
 * Props Definition
 * -------- */

/** Per-instance overrides of anything the provider declared. */
export interface QuerySuspenseViewOverrides<TData, TError = RequestError>
  extends Pick<ResolveQueryViewOptions<TData, TError>, 'isEmpty'> {
  /** Override the loading view for this boundary only — a table skeleton, a shimmering card */
  Loader?: SuspenseViewNode<TData, TError>;

  /** Override the error view for this boundary only */
  ErrorView?: SuspenseViewNode<TData, TError>;

  /** Override the missing-entity view for this boundary only */
  NotFound?: SuspenseViewNode<TData, TError>;

  /**
   * What to render instead of the content when the data is empty.
   *
   * Declaring it is the shorthand for "this query returns a list": `isEmpty` defaults to the
   * built-in array check as soon as it is present, so the common case needs one option.
   */
  emptyContent?: SuspenseViewNode<TData, TError>;

  /** Override the error classification for this boundary only */
  classifyError?: (error: TError) => QueryErrorKind;

  /** Force every error through the error view */
  debugErrors?: boolean;
}


export interface QuerySuspenseProps<TData, TProps extends {} = {}, TError = RequestError>
  extends SuspendedSkeleton<TData, TProps, TError>,
  QuerySuspenseViewOverrides<TData, TError> {
  /** Rendered once the query succeeded with non-empty data */
  Component: SuspendedComponent<TData, TProps, TError>;

  /** Props forwarded to `Component`, to the skeleton, and to every aside element */
  innerProps?: TProps;

  /** The query driving the boundary */
  query: UseQueryResult<TData, TError>;
}


/* --------
 * Internal Components
 * -------- */
type SkeletonProps<TData, TProps extends {}, TError> =
  React.PropsWithChildren<AnySuspendedContext<TData, TError> & TProps & SuspendedSkeleton<TData, TProps, TError>
  & { AsideWrapper?: React.ComponentType<React.PropsWithChildren> }>;


/**
 * The frame is rendered in every state, and its identity must stay stable across them: swapping
 * wrapper elements between pending and success remounts the subtree and throws away the scroll
 * position, which is exactly the flicker this component exists to avoid.
 */
function QuerySuspenseSkeleton<TData, TProps extends {}, TError>(
  props: SkeletonProps<TData, TProps, TError>
): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    children,

    AsideWrapper,
    ContentWrapper,
    Footer,
    Header,
    Wrapper,

    ...contextProps
  } = props;


  // ----
  // Layout Computation
  // ----
  const wrapperProps = contextProps as unknown as AnySuspendedContext<TData, TError> & TProps;

  const withWrapper = (
    UserWrapper: SuspendedWrapper<TData, TProps, TError> | undefined,
    content: React.ReactNode
  ) => (
    UserWrapper
      ? <UserWrapper {...wrapperProps}>{content}</UserWrapper>
      : <React.Fragment>{content}</React.Fragment>
  );

  const withAside = (content: React.ReactNode) => (
    AsideWrapper ? <AsideWrapper>{content}</AsideWrapper> : content
  );


  // ----
  // Component Render
  // ----
  return withWrapper(
    Wrapper,
    (
      <React.Fragment>
        {Header && withAside(<Header {...wrapperProps} />)}
        {withWrapper(ContentWrapper, children)}
        {Footer && withAside(<Footer {...wrapperProps} />)}
      </React.Fragment>
    )
  );

}


/* --------
 * Component Definition
 * -------- */

/**
 * Render one of five views out of a query: pending, error, missing entity, empty, content.
 *
 * This is the engine. Call sites normally reach it through `querySuspenseComponent`, which owns the
 * query too; use it directly only when the query is already in hand and has to stay there.
 *
 * The views come from `QuerySuspenseProvider`, so this component imports no UI kit and holds no
 * copy. What it owns is the part that kept being rewritten by hand at every call site: the order of
 * the checks, the stable frame around them, and the reload handler handed to each view.
 */
export function QuerySuspense<TData, TProps extends {} = {}, TError = RequestError>(
  props: QuerySuspenseProps<TData, TProps, TError>
): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    Component,
    innerProps,
    query,

    ErrorView: userDefinedErrorView,
    Loader: userDefinedLoader,
    NotFound: userDefinedNotFound,
    emptyContent: userDefinedEmptyContent,

    classifyError: userDefinedClassifyError,
    debugErrors: userDefinedDebugErrors,
    isEmpty: userDefinedIsEmpty,

    ...skeletonProps
  } = props;


  // ----
  // Internal Hooks
  // ----
  const config = useQuerySuspenseConfig<TError>();


  // ----
  // Handlers
  // ----
  const { refetch } = query;

  const reload = React.useCallback(
    async () => {
      /** A reload failure is already reported by the query state: never let it escape as a rejection */
      await refetch().catch(() => undefined);
    },
    [ refetch ]
  );


  // ----
  // Layout Computation
  // ----
  const Loader = userDefinedLoader ?? config.Loader;
  const ErrorView = userDefinedErrorView ?? config.ErrorView;
  const NotFound = userDefinedNotFound ?? config.NotFound ?? ErrorView;
  const emptyContent = userDefinedEmptyContent ?? config.emptyContent;

  const view = resolveQueryView<TData, TError>(query, {
    classifyError: userDefinedClassifyError ?? config.classifyError,
    debugErrors  : userDefinedDebugErrors ?? config.debugErrors,
    /** An empty view declared without a predicate means "this is a list" */
    isEmpty      : userDefinedIsEmpty ?? (emptyContent !== undefined && emptyContent !== null)
  });

  const contextProps = {
    ...(innerProps ?? {} as TProps),
    reload,
    state: query
  } as AnySuspendedContext<TData, TError> & TProps;

  const viewProps: SuspenseViewProps<TData, TError> = { error: query.error, reload, state: query };

  const frame = (content: React.ReactNode) => (
    <QuerySuspenseSkeleton<TData, TProps, TError>
      {...contextProps}
      {...skeletonProps}
      AsideWrapper={config.AsideWrapper}
    >
      {content}
    </QuerySuspenseSkeleton>
  );

  const aside = (content: React.ReactNode) => (
    config.AsideWrapper ? <config.AsideWrapper>{content}</config.AsideWrapper> : content
  );


  // ----
  // Component Render
  // ----
  if (view.kind === 'pending') {
    return frame(renderViewNode(Loader, viewProps));
  }

  if (view.kind === 'error') {
    return frame(aside(renderViewNode(ErrorView, viewProps)));
  }

  if (view.kind === 'notFound') {
    return frame(aside(renderViewNode(NotFound, viewProps)));
  }

  if (view.kind === 'empty') {
    return frame(renderViewNode(emptyContent, viewProps));
  }

  return (
    <SuspendedContext.Provider value={contextProps as unknown as SuccessSuspendedContext<TData, TError>}>
      {frame(<Component {...(innerProps ?? {} as TProps)} reload={reload} state={contextProps.state as any} />)}
    </SuspendedContext.Provider>
  );

}
