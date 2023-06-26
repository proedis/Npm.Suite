import * as React from 'react';

import type { ClientRequestConfig, RequestError } from '@proedis/client';

import { hasEqualHash, mergeObjects } from '@proedis/utils';

import { QueryClient, QueryClientProvider, replaceEqualDeep, useMutation, useQuery } from '@tanstack/react-query';
import type {
  QueryClientConfig,
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult
} from '@tanstack/react-query';

import { ClientProvider, useClient } from './clientContext';
import type { ClientProviderProps } from './clientContext';

import type { ClientTokens } from './clientContext.types';


/* --------
 * Hook Definition
 * -------- */

/**
 * @name useClientQuery
 * Special hook that wraps the original useQuery hook from @tanstack/react-query library.
 *
 * The logic behind this hook is that the query keys defined as an array of string and number
 * will be used, joined by a '/' char to build the full endpoint to call and to download data.
 *
 * If the request must be optimized with extra params, the second argument will be used
 * to enrich the underlying client request.
 *
 * Use the generic definition <R> to set the expected response type.
 *
 * @example
 *  // Using this will perform an API call to <client-base-url>/projects/5
 *  const data = useClientQuery(['projects', 5]);
 *
 *  // Using this will perform an API call to <client-base-url>/projects?search=my-client
 *  const data = useClientQuery(['projects'], { params: { search: 'my-client' } });
 *
 * @param key An array of string/number used to build the endpoint url
 * @param requestConfig Client request config enrich
 * @param options Optional options passed to underlying useQuery hook
 */
export function useClientQuery<R = unknown>(
  key: (string | number)[],
  requestConfig?: Omit<ClientRequestConfig<ClientTokens, R>, 'url'>,
  options?: Omit<UseQueryOptions<R, RequestError, R>, 'queryKey' | 'queryFn' | 'meta'>
): UseQueryResult<R, RequestError> {
  return useQuery<R, RequestError, R>(
    [ ...key, requestConfig ],
    {
      ...options,
      meta: {
        url: key.join('/'),
        ...requestConfig
      }
    }
  );
}


/**
 * @name useClientMutation
 * Special hook that wraps the original useMutation hook from @tanstack/react-query library.
 *
 * The logic behind this hook is that the query keys defined as an array of string and number
 * will be used, joined by a '/' char to build the full endpoint to call and to download data.
 *
 * The method of the mutation must be declared, and could be a plain string or a function that
 * will return the right method to use when the mutation is fired.
 *
 * If the request must be optimized with extra params, the third argument will be used
 * to enrich the underlying client request.
 * This argument must be a function that will be invoked passing as first argument the provided data to send
 *
 * Use the generic definition <D> to explicitly set the type of data that will be sent to server
 * and the generic <R> to set the expected response type.
 *
 * @param key An array of string/number used to build the endpoint url
 * @param method
 * @param requestConfig
 * @param options
 */
export function useClientMutation<D extends ({ [key: string]: any } | undefined) = any, R = unknown>(
  key: (string | number)[],
  method: ClientRequestConfig<ClientTokens, R>['method'] | ((data: D) => ClientRequestConfig<ClientTokens, R>['method']),
  requestConfig?: (data: D) => Omit<ClientRequestConfig<ClientTokens, R>, 'url' | 'method'>,
  options?: Omit<UseMutationOptions<R, RequestError, D>, 'mutationKey' | 'mutationFn'>
): UseMutationResult<R, RequestError, D> {
  /** Get the client using internal hook */
  const client = useClient();
  /** Return the result of the mutation hook */
  return useMutation<R, RequestError, D>({
    ...options,
    mutationKey: key,
    mutationFn : (data) => {
      /** Create the ClientRequestConfig to pass to client request method */
      const clientRequestConfig: ClientRequestConfig<ClientTokens, R> = {
        ...(typeof requestConfig === 'function' ? requestConfig(data) : {}),
        data,
        url   : key.join('/'),
        method: typeof method === 'function' ? method(data) : method
      };
      /** Return the result of the request */
      return client.request<R>(clientRequestConfig);
    }
  });
}


/* --------
 * Client with Query Provider
 * -------- */

interface ClientWithQueryProviderProps extends ClientProviderProps {
  /** Add extra configuration to QueryClient */
  queryClientConfig?: Partial<QueryClientConfig>;
}

export const ClientWithQueryProvider: React.FunctionComponent<React.PropsWithChildren<ClientWithQueryProviderProps>> = (
  (props) => {

    // ----
    // Props Deconstruct
    // ----
    const {
      children,

      client,
      queryClientConfig: userDefinedQueryClientConfig,

      ...clientProviderProps
    } = props;


    // ----
    // Build Default Props
    // ----
    const queryClient = React.useMemo<QueryClient>(
      () => {
        /** Store the DefaultConfiguration to use */
        const defaultConfiguration: QueryClientConfig = {
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

        /** Merge between default and user defined */
        const config = mergeObjects<QueryClientConfig>(defaultConfiguration, userDefinedQueryClientConfig || {});

        /** Return a new QueryClient */
        return new QueryClient(config);
      },
      [ client, userDefinedQueryClientConfig ]
    );


    // ----
    // Render the Provider
    // ----
    return (
      <ClientProvider client={client} {...clientProviderProps}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </ClientProvider>
    );
  }
);

ClientWithQueryProvider.displayName = 'ClientWithQueryProvider';
