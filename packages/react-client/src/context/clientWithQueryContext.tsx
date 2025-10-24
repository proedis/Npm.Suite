import * as React from 'react';

import { plainToInstance } from 'class-transformer';

import type { ClientRequestConfig, RequestError } from '@proedis/client';

import { mergeObjects } from '@proedis/utils';

import { QueryClient, QueryClientProvider, useMutation, useQuery } from '@tanstack/react-query';
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

import { createQueryClientDefaultOptions } from '../utils';


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
  /** Extract the transformer from the request config */
  const {
    transformer,
    ...restRequestConfig
  } = requestConfig || {};

  /** Return the result of the query hook */
  return useQuery<R, RequestError, R>(
    {
      ...options,
      queryKey: [ ...key, restRequestConfig ],
      meta    : {
        url: key.join('/'),
        ...restRequestConfig
      },
      select  : (data) => {
        /** If a transformer is defined, use it to transform the data */
        if (transformer) {
          return plainToInstance(transformer, data) as R;
        }
        /** Otherwise, return the data as is */
        return data;
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
export function useClientMutation<D, R = unknown>(
  key: (string | number)[] | ((data: D) => (string | number)[]),
  method: ClientRequestConfig<ClientTokens, R>['method'] | ((data: D) => ClientRequestConfig<ClientTokens, R>['method']),
  requestConfig?: (data: D) => Omit<ClientRequestConfig<ClientTokens, R>, 'url' | 'method'>,
  options?: Omit<UseMutationOptions<R, RequestError, D>, 'mutationKey' | 'mutationFn'>
): UseMutationResult<R, RequestError, D> {
  /** Get the client using internal hook */
  const client = useClient();
  /** Return the result of the mutation hook */
  return useMutation<R, RequestError, D>({
    ...options,
    mutationFn: (data) => {
      /** Create the ClientRequestConfig to pass to client request method */
      const clientRequestConfig: ClientRequestConfig<ClientTokens, R> = {
        ...(typeof requestConfig === 'function' ? requestConfig(data) : {}),
        url   : (typeof key === 'function' ? key(data) : key).join('/'),
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
        /** Merge between default and user defined */
        const config = mergeObjects<QueryClientConfig>(
          { defaultOptions: createQueryClientDefaultOptions(client) },
          userDefinedQueryClientConfig || {}
        );

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
