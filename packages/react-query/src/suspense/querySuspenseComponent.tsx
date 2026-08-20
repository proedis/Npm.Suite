import * as React from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { useSyncedRef, useUnmountEffect } from '@proedis/react';
import { useClientQuery } from '@proedis/react-client';

import type { QueryKey, UseQueryResult } from '@tanstack/react-query';
import type { RequestError } from '@proedis/client';
import { QuerySuspense } from './QuerySuspense';
import { useQuerySuspenseConfig } from './QuerySuspenseConfig.context';


import type { QuerySuspenseViewOverrides } from './QuerySuspense';

import type {
  PageTitleResolver,
  QuerySuspensePageTitle,
  SuspendedComponent,
  SuspendedSkeleton
} from './suspense.types';


/* --------
 * Internal Types
 * -------- */
type PlainOrBuilder<TOut, TProps> = TOut | ((props: TProps) => TOut);


/**
 * The arguments a query is described by: its key, the request config carrying the transformer, and
 * the query options — the parameters of `useClientQuery` itself.
 *
 * Readonly, so the `as const` tuple a generated `getXQueryArgs()` returns fits without a cast; and
 * bound to `TData`, so the transformer is checked against the type the component expects to render.
 */
export type QuerySuspenseQueryArgs<TData> = readonly [ ...Parameters<typeof useClientQuery<TData>> ];


export interface SuspendedComponentOptions<TData, TProps extends {} = {}, TError = RequestError>
  extends SuspendedSkeleton<TData, TProps, TError>,
  QuerySuspenseViewOverrides<TData, TError> {
  /** Page title per query state, pushed through `config.onTitleChange` */
  pageTitle?: QuerySuspensePageTitle<TData>;

  /**
   * The key to drop when `resetOnUnmount` is set.
   *
   * Defaults to the first of the query arguments, which is the key itself. Declare it to remove
   * something wider than what this component queried — the whole resource, through a generated
   * `getXQueryKey()` called with no argument.
   */
  queryKey?: PlainOrBuilder<QueryKey, TProps>;

  /**
   * Drop the query from the cache when the component unmounts.
   *
   * For a detail screen reached from a list this is usually what you want: coming back should show
   * a loader over fresh data, not a stale entity that was edited elsewhere meanwhile.
   */
  resetOnUnmount?: boolean;
}


/** The props of a built component: the caller's own props, plus the boundary's own controls. */
export type SuspendedComponentOuterProps<TData, TProps extends {} = {}> = TProps & {
  /** Called on every data change — the escape hatch for a parent that needs to mirror the data */
  onDataChange?: (data: TData | undefined) => void;

  /** Overrides the option of the same name for this instance */
  resetOnUnmount?: boolean;
};


/* --------
 * Helpers
 * -------- */
function resolveTitle<TData>(
  resolver: PageTitleResolver<TData> | undefined,
  data: TData,
  tools: object
): string | undefined {
  if (typeof resolver === 'function') {
    return resolver({ ...tools, data } as any);
  }

  return resolver;
}


/* --------
 * Component Builder
 * -------- */

/**
 * Pair a component with the query that feeds it.
 *
 * The query is described by the arguments of `useClientQuery` — which is exactly what
 * `proedis scaffold hooks` writes as `getXQueryArgs()`, and what call sites have always written by
 * hand. Nothing else is needed: the data type comes from the component, the error type is the
 * client's, and the key is the first argument.
 *
 * ```tsx
 * const ActivityDetail = querySuspenseComponent(
 *   ActivityDetailRender,
 *   props => getSingleActivityQueryArgs(props.id),
 *   { pageTitle: { success: ({ data }) => data.name } }
 * );
 * ```
 *
 * @param Component - What renders once the data is there. Usually built with `suspendedComponent`.
 * @param queryArgs - The query arguments, or a builder over the component props. Builders run during
 *  render, so they may call hooks of their own — a route layout reading `useParams()` inside one is
 *  a supported pattern.
 * @param options - See `SuspendedComponentOptions`.
 */
export function querySuspenseComponent<TData, TProps extends {} = {}>(
  Component: SuspendedComponent<TData, TProps, RequestError>,
  queryArgs: PlainOrBuilder<QuerySuspenseQueryArgs<TData>, SuspendedComponentOuterProps<TData, TProps>>,
  options?: PlainOrBuilder<
    SuspendedComponentOptions<TData, TProps>,
    SuspendedComponentOuterProps<TData, TProps>
  >
): React.FunctionComponent<SuspendedComponentOuterProps<TData, TProps>> {

  const SuspendedHoc: React.FunctionComponent<SuspendedComponentOuterProps<TData, TProps>> = (props) => {

    // ----
    // Props Deconstruct
    // ----
    const {
      onDataChange,
      resetOnUnmount: userDefinedResetOnUnmount,
      ...componentProps
    } = props;


    // ----
    // Options Deconstruct
    // ----
    const {
      pageTitle,
      queryKey: userDefinedQueryKey,
      resetOnUnmount: optionsResetOnUnmount,
      ...querySuspenseProps
    } = (typeof options === 'function' ? options(props) : options) ?? {};


    // ----
    // Internal Hooks
    // ----
    const { defaultTitles, onTitleChange, titleTools } = useQuerySuspenseConfig();
    const queryClient = useQueryClient();

    const onDataChangeRef = useSyncedRef(onDataChange);
    const onTitleChangeRef = useSyncedRef(onTitleChange);
    const pageTitleRef = useSyncedRef(pageTitle);
    const defaultTitlesRef = useSyncedRef(defaultTitles);
    const titleToolsRef = useSyncedRef(titleTools);

    /** The last title pushed out, so a stable title is never re-emitted */
    const emittedTitleRef = React.useRef<string | null>(null);


    // ----
    // Query Data
    // ----
    const resolvedQueryArgs = typeof queryArgs === 'function' ? queryArgs(props) : queryArgs;
    const queryResult = useClientQuery<TData>(...resolvedQueryArgs) as UseQueryResult<TData, RequestError>;

    const queryKey = (typeof userDefinedQueryKey === 'function'
      ? userDefinedQueryKey(componentProps as unknown as TProps)
      : userDefinedQueryKey) ?? resolvedQueryArgs[0];

    const queryKeyRef = useSyncedRef(queryKey);


    // ----
    // Lifecycle Events
    // ----
    React.useEffect(
      () => {
        const { current: emitTitle } = onTitleChangeRef;
        const { current: titles } = pageTitleRef;

        if (!emitTitle || !titles) {
          return;
        }

        const tools = titleToolsRef.current ?? {};
        const fallbacks = defaultTitlesRef.current;

        const nextTitle = (() => {
          if (queryResult.status === 'pending') {
            return resolveTitle(titles.pending, null, tools) ?? fallbacks?.pending;
          }

          if (queryResult.status === 'error') {
            return resolveTitle(titles.error, null, tools) ?? fallbacks?.error;
          }

          return resolveTitle(titles.success, queryResult.data, tools);
        })();

        if (nextTitle && nextTitle !== emittedTitleRef.current) {
          emittedTitleRef.current = nextTitle;
          emitTitle(nextTitle);
        }
      },
      [ defaultTitlesRef, onTitleChangeRef, pageTitleRef, queryResult.data, queryResult.status, titleToolsRef ]
    );

    React.useEffect(
      () => {
        onDataChangeRef.current?.(queryResult.data);
      },
      [ onDataChangeRef, queryResult.data ]
    );

    useUnmountEffect(() => {
      const keyToRemove = queryKeyRef.current;

      if ((userDefinedResetOnUnmount ?? optionsResetOnUnmount) && keyToRemove) {
        queryClient.removeQueries({ queryKey: keyToRemove });
      }
    });


    // ----
    // Component Render
    // ----
    return (
      <QuerySuspense<TData, TProps, RequestError>
        {...querySuspenseProps}
        Component={Component}
        innerProps={componentProps as unknown as TProps}
        query={queryResult}
      />
    );

  };

  SuspendedHoc.displayName = `Suspended(${Component.displayName || Component.name || 'Component'})`;

  return SuspendedHoc;

}
