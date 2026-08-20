import { plainToInstance } from 'class-transformer';
import type { ClassConstructor } from 'class-transformer';

import type { UseQueryOptions } from '@tanstack/react-query';

import type { ClientRequestConfig, RequestError } from '@proedis/client';

import { useClientQuery } from '../context';
import type { ClientTokens } from '../context';


/* --------
 * Public Types
 * -------- */
/** The query string a paginated endpoint expects */
export interface PaginatedRequest {
  /** The property to order by */
  _orderBy: string;

  /** The page being asked for */
  _page: number;

  /** How many items the page carries */
  _pageSize: number;
}

/** What a paginated endpoint answers with: the page, and where the page sits */
export interface PaginatedResponse<T> {
  /** The items of the requested page */
  data: T[];

  /** Where this page sits within the whole set */
  metadata: PaginatedResponseMetadata;
}

export interface PaginatedResponseMetadata {
  currentPage: number;

  hasNextPage: boolean;

  hasPreviousPage: boolean;

  pageSize: number;

  totalElementsCount: number;

  totalPages: number;
}


/* --------
 * Internal Types
 * -------- */
/**
 * The transformer describes the **item**, not the envelope.
 *
 * A paginated payload is metadata plus an array, and `class-transformer` cannot be handed a
 * generic envelope: the decorators of `PaginatedResponse<T>` would have to know T at runtime,
 * which they never do. Transforming the array instead keeps one declaration per entity and needs
 * no generated wrapper per page shape.
 */
type PaginatedRequestConfig<Response> =
  & Omit<ClientRequestConfig<ClientTokens, PaginatedResponse<Response>>, 'transformer' | 'url'>
  & { transformer?: ClassConstructor<Response> };

type PaginatedQueryOptions<Response> = Omit<
  UseQueryOptions<PaginatedResponse<Response>, RequestError, PaginatedResponse<Response>>,
  'meta' | 'queryFn' | 'queryKey'
>;


/* --------
 * Hook Definition
 * -------- */
/**
 * Query a paginated endpoint, transforming the items of the page and leaving its metadata alone.
 *
 * @param key The query key, joined to build the endpoint url
 * @param pagination The page being asked for, merged into the query string
 * @param requestConfig The request config, whose transformer describes a single item
 * @param options Options forwarded to the underlying query
 */
export function usePaginatedClientQuery<R = unknown>(
  key: (number | string)[],
  pagination: PaginatedRequest,
  requestConfig?: PaginatedRequestConfig<R>,
  options?: PaginatedQueryOptions<R>
) {
  const {
    transformer,
    params,
    ...restRequestConfig
  } = requestConfig || {};

  return useClientQuery<PaginatedResponse<R>>(
    key,
    {
      ...restRequestConfig,
      params: {
        ...params,
        ...pagination
      }
    },
    {
      ...options,
      select: (data) => (transformer
        ? { data: plainToInstance(transformer, data.data) as R[], metadata: data.metadata }
        : data)
    }
  );
}
