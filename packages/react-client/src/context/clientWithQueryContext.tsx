import * as React from 'react';

import { hasEqualHash, mergeObjects } from '@proedis/utils';

import type { Client } from '@proedis/client';
import type { ClientRequestConfig, RequestError } from '@proedis/client';
import type { Serializable } from '@proedis/types';

import { QueryClient, QueryClientProvider, replaceEqualDeep, useMutation, useQuery } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import type {
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
 * Internal Types
 * -------- */
export interface ClientWithQueryContextTools<UD extends Serializable, SD extends Serializable, T extends string>
  extends ClientContextTools<UD, SD, T> {

  ClientWithQueryProvider: React.FunctionComponent<React.PropsWithChildren>;

  useClientQuery<R = unknown, QK extends QueryKey = QueryKey>(
    key: QK,
    requestConfig?: Omit<ClientRequestConfig<T>, 'url'>,
    options?: Omit<UseQueryOptions<R, RequestError, R, QK>, 'queryKey' | 'queryFn'>
  ): UseQueryResult<R, RequestError>;

  useClientMutation<D extends { [key: string]: any } = any, R = void, MK extends MutationKey = MutationKey>(
    key: MK,
    method: ClientRequestConfig<T>['method'] | ((variables: D) => ClientRequestConfig<T>['method']),
    requestConfig?: (variables: D) => Omit<ClientRequestConfig<T>, 'url' | 'method'>,
    options?: Omit<UseMutationOptions<R, RequestError, D, MK>, 'mutationKey' | 'mutationFn'>
  ): UseMutationResult<R, RequestError, D, MK>;

}


/* --------
 * Component Definition
 * -------- */
export function createClientWithQueryContext<UD extends Serializable, SD extends Serializable, T extends string>(
  client: Client<UD, SD, T>,
  config?: QueryClientConfig
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

  const queryClient = new QueryClient(mergeObjects<QueryClientConfig>(defaultQueryClientConfiguration, config ?? {}));


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
    requestConfig?: Omit<ClientRequestConfig<T>, 'url'>,
    options?: Omit<UseQueryOptions<R, RequestError, R, QK>, 'queryKey' | 'queryFn' | 'meta'>
  ): UseQueryResult<R, RequestError> {
    return useQuery<R, RequestError, R, QK>(
      key,
      {
        ...options,
        meta: requestConfig
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
  // Return built context
  // ----
  return {
    ...baseContext,
    ClientWithQueryProvider,
    useClientQuery,
    useClientMutation
  };

}
