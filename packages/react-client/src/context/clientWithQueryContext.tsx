import * as React from 'react';

import { plainToInstance } from 'class-transformer';
import type { ClassConstructor } from 'class-transformer';

import { hasEqualHash, mergeObjects } from '@proedis/utils';

import type { Client } from '@proedis/client';
import type { ClientRequestConfig, RequestError } from '@proedis/client';
import type { Serializable } from '@proedis/types';

import {
  QueryClient,
  QueryClientProvider,
  replaceEqualDeep,
  useMutation,
  useQuery
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import type {
  DefinedUseQueryResult,
  QueryClientConfig,
  QueryKey,
  UseQueryOptions,
  UseQueryResult,
  MutationKey,
  UseMutationOptions,
  UseMutationResult
} from '@tanstack/react-query';

import { createClientContext } from './clientContext';
import type { ClientContextTools } from './clientContext';


/* --------
 * Exporting Types
 * -------- */
export interface ClientWithQueryContextTools<
  UD extends Serializable,
  SD extends Serializable,
  T extends string,
  LoaderComponentProps extends {}
> extends ClientContextTools<UD, SD, T> {

  asSuspendedComponent<R, Props extends {}, QK extends QueryKey = QueryKey>(
    Component: SuspendedComponent<R, Props>,
    key: PlainOrBuilder<Omit<Props, keyof SuccessComponentProps<R>>, QK>,
    requestConfig?: Omit<ClientRequestConfig<T>, 'url'>,
    options?: AsSuspendedComponentOptions<R, Props, LoaderComponentProps, QK>
  ): React.FunctionComponent<Omit<Props, keyof SuccessComponentProps<R>>>;

  ClientWithQueryProvider: React.FunctionComponent<React.PropsWithChildren>;

  useClientQuery<R = unknown, QK extends QueryKey = QueryKey>(
    key: QK,
    transformer?: ClassConstructor<R extends Array<infer U> ? U : R> | undefined,
    requestConfig?: Omit<ClientRequestConfig<T>, 'url'>,
    options?: Omit<UseQueryOptions<R, RequestError, R, QK>, 'queryKey' | 'queryFn' | 'meta'>
  ): UseQueryResult<R, RequestError>;

  useClientMutation<D extends { [key: string]: any } = any, R = void, MK extends MutationKey = MutationKey>(
    key: MK,
    method: ClientRequestConfig<T>['method'] | ((variables: D) => ClientRequestConfig<T>['method']),
    requestConfig?: (variables: D) => Omit<ClientRequestConfig<T>, 'url' | 'method'>,
    options?: Omit<UseMutationOptions<R, RequestError, D, MK>, 'mutationKey' | 'mutationFn'>
  ): UseMutationResult<R, RequestError, D, MK>;

}

/** A component render function that is wrapped by the asSuspendedComponent HOC */
export type SuspendedComponent<Result, Props extends {} = {}> =
  React.FunctionComponent<SuccessComponentProps<Result> & Props>;

/** A custom component usable to wrap all Suspended Components */
export type SuspendedComponentWrapper<Result, Props extends {} = {}> =
  React.FunctionComponent<React.PropsWithChildren<AsideComponentProps<Result>> & Props>;

/** A custom component that will be rendered before or after the suspended component */
export type SuspendedAsideComponent<Result, Props extends {} = {}> =
  React.FunctionComponent<AsideComponentProps<Result> & Props>;


/** */


/* --------
 * Internal Types
 * -------- */

/** Options defined while creating the Client Context */
interface ClientWithQueryContextConfiguration<LoaderComponentProps extends {}> {
  /** The error component used to show the query error message */
  errorComponent?: React.FunctionComponent<{ error: RequestError }>;

  /** The loader component to use while executing queries in SuspendedComponent */
  loaderComponent?: React.FunctionComponent<LoaderComponentProps>;

  /** The default loader props to use while rendering loader */
  loaderProps?: LoaderComponentProps;

  /** Default options for QueryClient */
  queryClientConfig?: QueryClientConfig;
}

/** A type that represent a variable that could be a function that will return a result, or the result itself */
type PlainOrBuilder<Props extends {}, T> = T | ((props: Props) => T);

/** Props assigned automatically to the component when query status is success */
type SuccessComponentProps<Result> = {
  state: DefinedUseQueryResult<Result, RequestError>
};

/** Props assigned automatically to any aside component that are not depending by the query state */
type AsideComponentProps<Result> = {
  state: UseQueryResult<Result, RequestError>
};

/** Usable options for asSuspendedComponent HOC */
interface AsSuspendedComponentOptions<Result, Props extends {}, LoaderProps extends {}, QK extends QueryKey = QueryKey> {
  /** Component to render after the suspended component */
  Footer?: SuspendedAsideComponent<Result, Props>;

  /** Component to render before the suspended component */
  Header?: SuspendedAsideComponent<Result, Props>;

  /** Override Loader Props */
  loaderProps?: Partial<LoaderProps>;

  /** Query options */
  query?: Omit<UseQueryOptions<Result, RequestError, Result, QK>, 'queryKey' | 'queryFn' | 'meta'>;

  /** Apply a transformer to the query result */
  transformer?: ClassConstructor<Result extends Array<infer U> ? U : Result> | undefined,

  /** A wrapper component, used to wrap internal component */
  Wrapper?: SuspendedComponentWrapper<Result, Props>;
}


/* --------
 * Component Definition
 * -------- */
export function createClientWithQueryContext<
  UD extends Serializable,
  SD extends Serializable,
  T extends string,
  LoaderComponentProps extends {}
>(
  client: Client<UD, SD, T>,
  config?: ClientWithQueryContextConfiguration<LoaderComponentProps>
): ClientWithQueryContextTools<UD, SD, T, LoaderComponentProps> {

  // ----
  // Create the base ClientContext
  // ----
  const baseContext = createClientContext(client);


  // ----
  // Create the QueryClient
  // ----
  const defaultQueryClientConfiguration: QueryClientConfig = {
    defaultOptions: {
      /** Set default options for query */
      queries: {
        /** Enable by default the refetch options */
        refetchOnMount      : true,
        refetchOnReconnect  : true,
        refetchOnWindowFocus: true,

        /** Change the function to assert data is equal or not */
        structuralSharing: (oldData, newData) => (
          hasEqualHash(oldData, newData) ? oldData : replaceEqualDeep(oldData, newData)
        ),

        /** Set the default query function to use client instance to perform request */
        queryFn: (ctx) => {
          /** Get current key and query meta */
          const { queryKey, meta: requestConfig } = ctx;
          /** Use the base client request method to fetch data */
          return client.request({
            method: 'GET',
            ...(requestConfig),
            url: queryKey.join('/')
          });
        }
      }
    }
  };

  const queryClient = new QueryClient(mergeObjects<QueryClientConfig>(
    defaultQueryClientConfiguration,
    config?.queryClientConfig ?? {}
  ));


  // ----
  // Create the ClientWithQueryProvider
  // ----
  const ClientWithQueryProvider: React.FunctionComponent<React.PropsWithChildren> = (props) => {

    /** Extract children from provided props */
    const { children } = props;

    /** Wrap the query provider using custom query client */
    return (
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools position={'bottom-right'} />
      </QueryClientProvider>
    );
  };


  // ----
  // Create the useClientQuery helper
  // ----
  function useClientQuery<R = unknown, QK extends QueryKey = QueryKey>(
    key: QK,
    transformer?: ClassConstructor<R extends Array<infer U> ? U : R> | undefined,
    requestConfig?: Omit<ClientRequestConfig<T>, 'url'>,
    options?: Omit<UseQueryOptions<R, RequestError, R, QK>, 'queryKey' | 'queryFn' | 'meta'>
  ): UseQueryResult<R, RequestError> {
    return useQuery<R, RequestError, R, QK>(
      key,
      {
        ...options,
        meta  : requestConfig,
        select: (data) => (transformer ? plainToInstance(transformer, data) : data) as R
      }
    );
  }


  // ----
  // Crate the useClientMutation helper
  // ----
  function useClientMutation<D extends { [key: string]: any } = any, R = void, MK extends MutationKey = MutationKey>(
    key: MK,
    method: ClientRequestConfig<T>['method'] | ((variables: D) => ClientRequestConfig<T>['method']),
    requestConfig?: (variables: D) => Omit<ClientRequestConfig<T>, 'url' | 'method'>,
    options?: Omit<UseMutationOptions<R, RequestError, D, MK>, 'mutationKey' | 'mutationFn'>
  ): UseMutationResult<R, RequestError, D, MK> {
    return useMutation<R, RequestError, D, MK>({
      ...options,
      mutationKey: key,
      mutationFn : (variables) => {
        /** Build the client request config to use with this mutation */
        const clientRequestConfig: ClientRequestConfig<T> = {
          data: variables,
          ...(typeof requestConfig === 'function' ? requestConfig(variables) : {}),
          url   : key.join('/'),
          method: typeof method === 'function' ? method(variables) : method
        };
        /** Return the result of the config */
        return client.request<R>(clientRequestConfig);
      }
    });
  }


  // ----
  // Create the asSuspendedComponent helper
  // ----
  function asSuspendedComponent<R, Props extends {}, QK extends QueryKey = QueryKey>(
    Component: SuspendedComponent<R, Props>,
    key: PlainOrBuilder<Omit<Props, keyof SuccessComponentProps<R>>, QK>,
    requestConfig?: Omit<ClientRequestConfig<T>, 'url'>,
    options?: AsSuspendedComponentOptions<R, Props, LoaderComponentProps, QK>
  ): React.FunctionComponent<Omit<Props, keyof SuccessComponentProps<R>>> {

    /** Get the default loader component and its props */
    const {
      errorComponent : ErrorMessage,
      loaderComponent: Loader,
      loaderProps    : defaultLoaderProps
    } = config || {};

    /** Get default from HOC function */
    const {
      Footer : UserDefinedFooter,
      Header : UserDefinedHeader,
      Wrapper: UserDefinedWrapper
    } = options || {};


    // ----
    // Main Content Wrapper Definition
    // ----

    const ContentWrapper: SuspendedComponentWrapper<R, Props> = (wrapperProps) => {
      /** Use a generic Fragment when Wrapper has not been defined */
      if (!UserDefinedWrapper) {
        return (
          <React.Fragment>
            {wrapperProps.children}
          </React.Fragment>
        );
      }

      /** Render the user defined wrapper */
      return (
        <UserDefinedWrapper {...wrapperProps} />
      );
    };


    // ----
    // Suspended Component Wrapper Definition
    // ----

    const SuspendedWrapper: SuspendedComponentWrapper<R, Props> = (wrapperProps) => {
      const { children, ...rest } = wrapperProps;

      /** If no user defined component exists, wrap with a Fragment */
      if (!UserDefinedWrapper) {
        return (
          <React.Fragment>
            {UserDefinedHeader && (
              <UserDefinedHeader {...rest as any} />
            )}
            <ContentWrapper {...wrapperProps} />
            {UserDefinedFooter && (
              <UserDefinedFooter {...rest as any} />
            )}
          </React.Fragment>
        );
      }

      /** Use the user defined wrapper to render data */
      return (
        <UserDefinedWrapper {...rest as any}>
          {UserDefinedHeader && (
            <UserDefinedHeader {...rest as any} />
          )}
          <ContentWrapper {...wrapperProps} />
          {UserDefinedFooter && (
            <UserDefinedFooter {...rest as any} />
          )}
        </UserDefinedWrapper>
      );
    };


    /** Create the Component to Return */
    const Suspended: React.FunctionComponent<Omit<Props, keyof SuccessComponentProps<R>>> = (props) => {


      // ----
      // UseQuery Hook Execution
      // ----

      /** Build or keep useQuery key */
      const queryKey = typeof key === 'function' ? key(props) : key;

      /** Run the useQuery hook */
      const queryState = useClientQuery(queryKey, options?.transformer, requestConfig, options?.query);


      // ----
      // Data Builder
      // ----

      /** Create props to pass to Aside Component */
      const asideComponentProps = {
        ...props,
        state: queryState
      } as AsideComponentProps<R> & Props;


      // ----
      // Component Render while Loading
      // ----

      if (queryState.status === 'loading') {
        /** Render the loader only if it exists */
        if (Loader) {
          return (
            <SuspendedWrapper {...asideComponentProps}>
              <Loader
                {...defaultLoaderProps as LoaderComponentProps}
                {...options?.loaderProps}
              />
            </SuspendedWrapper>
          );
        }

        /** If no loader exists, return nothing */
        return (
          <SuspendedWrapper {...asideComponentProps}>
            <React.Fragment />
          </SuspendedWrapper>
        );
      }


      // ----
      // Component Render if Error Occur
      // ----

      if (queryState.status === 'error') {
        if (ErrorMessage) {
          return (
            <SuspendedWrapper {...asideComponentProps}>
              <ErrorMessage error={queryState.error} />
            </SuspendedWrapper>
          );
        }

        return (
          <SuspendedWrapper {...asideComponentProps}>
            <div>
              <div><b>[{queryState.error.statusCode}] - {queryState.error.error}</b></div>
              <div>{queryState.error.message}</div>
            </div>
          </SuspendedWrapper>
        );
      }


      // ----
      // Component Render when Success
      // ----

      return (
        <SuspendedWrapper {...asideComponentProps}>
          <Component
            {...props as Props}
            state={queryState}
          />
        </SuspendedWrapper>
      );

    };

    Suspended.displayName = 'Suspended';

    return Suspended;

  }


  // ----
  // Return built context
  // ----
  return {
    ...baseContext,
    asSuspendedComponent,
    ClientWithQueryProvider,
    useClientQuery,
    useClientMutation
  };

}
