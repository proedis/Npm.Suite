import * as React from 'react';

import { contextBuilder } from '@proedis/react';

import { hasEqualHash, mergeObjects, isBrowser } from '@proedis/utils';

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
  QueryClientConfig,
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
export interface ClientQueryHooks<T extends string> extends Pick<ClientContextTools<any, any, T>, 'useClient'> {
  useClientQuery<R = unknown>(
    key: QueryClientKey,
    requestConfig?: Omit<ClientRequestConfig<T, R>, 'url'>,
    options?: Omit<UseQueryOptions<R, RequestError, R, QueryClientKey>, 'queryKey' | 'queryFn' | 'meta'>
  ): UseQueryResult<R, RequestError>;

  useClientMutation<D extends { [key: string]: any } = any, R = void, MK extends MutationKey = MutationKey>(
    key: MK,
    method: ClientRequestConfig<T, R>['method'] | ((variables: D) => ClientRequestConfig<T, R>['method']),
    requestConfig?: (variables: D) => Omit<ClientRequestConfig<T, R>, 'url' | 'method'>,
    options?: Omit<UseMutationOptions<R, RequestError, D, MK>, 'mutationKey' | 'mutationFn'>
  ): UseMutationResult<R, RequestError, D, MK>;
}

export interface ClientWithQueryContextTools<
  UD extends Serializable,
  SD extends Serializable,
  T extends string
> extends ClientContextTools<UD, SD, T>, Omit<ClientQueryHooks<T>, 'useClient'> {
  ClientWithQueryProvider: React.FunctionComponent<React.PropsWithChildren>;
}


/* --------
 * Internal Types
 * -------- */

/** Options defined while creating the Client Context */
interface ClientWithQueryContextConfiguration {
  /** Default options for QueryClient */
  queryClientConfig?: QueryClientConfig;
}

/** The client query type restricted to string | number array */
type QueryClientKey = (string | number)[];


/* --------
 * Client Hooks Provider
 * -------- */
const {
  useClientQueryHooks,
  ClientQueryHooksProvider
} = contextBuilder<ClientQueryHooks<any>, 'ClientQueryHooks'>('ClientQueryHooks');


/* --------
 * Component Definition
 * -------- */
export function createClientWithQueryContext<UD extends Serializable, SD extends Serializable, T extends string>(
  client: Client<UD, SD, T>,
  config?: ClientWithQueryContextConfiguration
): ClientWithQueryContextTools<UD, SD, T> {

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
          const { meta: requestConfig } = ctx;
          /** Use the base client request method to fetch data */
          return client.request({
            method: 'GET',
            ...requestConfig
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
  // Create the useClientQuery helper
  // ----
  /* eslint-disable @typescript-eslint/indent */
  function useClientQuery<R = unknown>(
    key: (string | number)[],
    requestConfig?: Omit<ClientRequestConfig<T, R>, 'url'>,
    options?: Omit<UseQueryOptions<R, RequestError, R, (string | number)[]>, 'queryKey' | 'queryFn' | 'meta'>
  ): UseQueryResult<R, RequestError> {
    return useQuery<R, RequestError, R, (string | number)[]>(
      [ ...key, requestConfig as any ],
      {
        ...options,
        meta: {
          url: key.join('/'),
          ...requestConfig
        }
      }
    );
  }

  /* eslint-enable */


  // ----
  // Crate the useClientMutation helper
  // ----
  function useClientMutation<D extends { [key: string]: any } = any, R = void, MK extends MutationKey = MutationKey>(
    key: MK,
    method: ClientRequestConfig<T, R>['method'] | ((variables: D) => ClientRequestConfig<T, R>['method']),
    requestConfig?: (variables: D) => Omit<ClientRequestConfig<T, R>, 'url' | 'method'>,
    options?: Omit<UseMutationOptions<R, RequestError, D, MK>, 'mutationKey' | 'mutationFn'>
  ): UseMutationResult<R, RequestError, D, MK> {
    return useMutation<R, RequestError, D, MK>({
      ...options,
      mutationKey: key,
      mutationFn : (variables) => {
        /** Build the client request config to use with this mutation */
        const clientRequestConfig: ClientRequestConfig<T, R> = {
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
  // Create the ClientWithQueryProvider
  // ----
  const ClientWithQueryProvider: React.FunctionComponent<React.PropsWithChildren> = (props) => {

    /** Extract the base Context Provider */
    const { ClientProvider } = baseContext;

    /** Extract children from provided props */
    const { children } = props;

    /** Wrap the query provider using custom query client */
    return (
      <ClientProvider>
        <QueryClientProvider client={queryClient}>
          <ClientQueryHooksProvider value={{ useClientQuery, useClientMutation, useClient: baseContext.useClient }}>
            {children}
          </ClientQueryHooksProvider>
          {isBrowser && <ReactQueryDevtools position={'bottom-right'} />}
        </QueryClientProvider>
      </ClientProvider>
    );
  };


  // ----
  // Return built context
  // ----
  return {
    ...baseContext,
    ClientWithQueryProvider,
    useClientQuery,
    useClientMutation
  };

}

export { useClientQueryHooks };
